"""Run the advisory engine over every farm and save what it finds.

This is the job that would run on a schedule (cron / Celery beat) once the
robots are live - pull the forecast, read the latest soil samples, and refresh
each farm's recommendations and tasks.

Usage:
    python manage.py run_advisory                    # all farms, save results
    python manage.py run_advisory --dry-run          # print, save nothing
    python manage.py run_advisory --farm "Green Valley Farm"
    python manage.py run_advisory --no-weather       # skip the API call
    python manage.py run_advisory --no-tasks         # recommendations only
"""

from django.core.management.base import BaseCommand, CommandError

from core.models import Farm
from core.services.advisory import run_advisory, save_advisory

PRIORITY_STYLE = {"High": "ERROR", "Medium": "WARNING", "Low": "NOTICE"}


class Command(BaseCommand):
    help = "Generate recommendations and tasks from sensor data and the forecast."

    def add_arguments(self, parser):
        parser.add_argument("--farm", help="Only this farm, by name.")
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print the advice without writing anything.",
        )
        parser.add_argument(
            "--no-weather",
            action="store_true",
            help="Use stored weather instead of calling WeatherAPI.",
        )
        parser.add_argument(
            "--no-tasks",
            action="store_true",
            help="Save recommendations but do not raise tasks from them.",
        )

    def handle(self, *args, **options):
        farms = Farm.objects.all().order_by("name")
        if options["farm"]:
            farms = farms.filter(name=options["farm"])
            if not farms.exists():
                raise CommandError(f"No farm named {options['farm']!r}.")
        if not farms.exists():
            raise CommandError("No farms in the database.")

        totals = {"recs": 0, "tasks": 0, "retired": 0}

        for farm in farms:
            result = run_advisory(farm, refresh_weather=not options["no_weather"])
            quality = result["dataQuality"]

            self.stdout.write("")
            self.stdout.write(self.style.MIGRATE_HEADING(f"{farm.name} ({farm.owner})"))
            self.stdout.write(f"  {result['summary']}")

            if not quality["hasSensorData"]:
                self.stdout.write(self.style.WARNING("  No sensor data for this farm."))
            elif quality["isStale"]:
                self.stdout.write(
                    self.style.WARNING(
                        f"  Sensor data is {quality['readingAgeHours']}h old."
                    )
                )
            if not quality["hasWeather"]:
                self.stdout.write(
                    self.style.WARNING(
                        "  No weather available - forecast rules were skipped. "
                        "Set WEATHERAPI_KEY to enable them."
                    )
                )

            for item in result["recommendations"]:
                style = getattr(self.style, PRIORITY_STYLE.get(item["priority"], "NOTICE"))
                label = style("[{}]".format(item["priority"]))
                self.stdout.write(
                    "    {} {}: {}".format(label, item["type"], item["title"])
                )
                for reason in item["reasons"]:
                    self.stdout.write("        - {}".format(reason))

            if options["dry_run"]:
                continue

            saved = save_advisory(farm, result, create_tasks=not options["no_tasks"])
            totals["recs"] += saved["recommendationsCreated"] + saved["recommendationsUpdated"]
            totals["tasks"] += saved["tasksCreated"]
            totals["retired"] += saved["recommendationsRetired"]

        self.stdout.write("")
        if options["dry_run"]:
            self.stdout.write(self.style.NOTICE("Dry run - nothing was saved."))
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Saved {totals['recs']} recommendation(s), raised "
                    f"{totals['tasks']} new task(s), retired {totals['retired']} "
                    f"that no longer apply."
                )
            )
