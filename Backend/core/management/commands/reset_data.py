"""Wipe every record so you can walk a flow from a blank dashboard.

Keeps staff logins - otherwise there would be no way back into the admin
panel. Everything else goes: customers and their logins, farms, robots,
assignment history, tasks and all the sensor-side tables.

Usage:
    python manage.py reset_data          # asks first
    python manage.py reset_data --yes    # no prompt (scripts, repeat testing)
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import (
    ActivityLog,
    Crop,
    Farm,
    Farmer,
    Recommendation,
    Robot,
    RobotHistory,
    SensorData,
    Soil,
    Task,
    Weather,
)

# Order matters only for readability - the FKs cascade either way.
MODELS = [
    ActivityLog,
    RobotHistory,
    SensorData,
    Task,
    Recommendation,
    Weather,
    Crop,
    Soil,
    Robot,
    Farm,
    Farmer,
]


class Command(BaseCommand):
    help = "Delete all app data, keeping only staff logins."

    def add_arguments(self, parser):
        parser.add_argument(
            "--yes",
            action="store_true",
            help="Skip the confirmation prompt.",
        )

    def handle(self, *args, **options):
        User = get_user_model()
        customer_logins = User.objects.filter(is_staff=False)

        counts = [(m.__name__, m.objects.count()) for m in MODELS]
        counts.append(("customer logins", customer_logins.count()))
        total = sum(n for _, n in counts)

        if total == 0:
            self.stdout.write(self.style.NOTICE("Already empty - nothing to do."))
            return

        self.stdout.write("About to permanently delete:")
        for name, n in counts:
            if n:
                self.stdout.write(f"  {name:20} {n}")

        if not options["yes"]:
            answer = input("\nType 'yes' to continue: ").strip().lower()
            if answer != "yes":
                self.stdout.write(self.style.WARNING("Cancelled - nothing deleted."))
                return

        with transaction.atomic():
            for model in MODELS:
                model.objects.all().delete()
            customer_logins.delete()

        kept = User.objects.filter(is_staff=True).count()
        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted {total} records. Kept {kept} staff login(s)."
            )
        )
