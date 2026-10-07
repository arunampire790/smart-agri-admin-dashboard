"""Seed the field data the advisory engine reads.

The robots are not sending anything yet, so the engine has nothing to reason
over. This fills that gap with a believable history: a soil profile and crop
row per farm, plus a sensor reading every few hours going back a week.

Readings are not noise - they follow a scenario per farm (drying out,
waterlogged, nutrient-starved, healthy) so that running the advisory
afterwards produces genuinely different advice for different farms instead of
the same generic line everywhere.

Usage:
    python manage.py seed_sensor_data
    python manage.py seed_sensor_data --days 14 --interval 2
    python manage.py seed_sensor_data --farm "Green Valley Farm" --scenario dry
    python manage.py seed_sensor_data --reset
    python manage.py seed_sensor_data --no-agronomy   # readings only
"""

import math
import random
from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.db.models import Q
from django.utils import timezone

from core.models import Crop, Farm, Robot, SensorData, Soil

# Each scenario is a starting point plus a direction of travel, so the last
# reading - the one the engine acts on - lands where the scenario promises.
SCENARIOS = {
    "dry": {
        "label": "drying out, no rain for days",
        "moisture_start": 46,
        "moisture_end": 18,
        "npk": (58, 30, 150),
        "temp": (26, 39),
        "humidity": (28, 48),
        "rain": 0.0,
    },
    "wet": {
        "label": "waterlogged after heavy rain",
        "moisture_start": 52,
        "moisture_end": 82,
        "npk": (45, 22, 110),
        "temp": (19, 27),
        "humidity": (78, 95),
        "rain": 11.0,
    },
    "hungry": {
        "label": "moisture fine, soil is nutrient-starved",
        "moisture_start": 44,
        "moisture_end": 38,
        "npk": (26, 14, 78),
        "temp": (22, 32),
        "humidity": (55, 72),
        "rain": 0.4,
    },
    "healthy": {
        "label": "everything in range",
        "moisture_start": 48,
        "moisture_end": 44,
        "npk": (95, 38, 190),
        "temp": (21, 30),
        "humidity": (58, 74),
        "rain": 1.2,
    },
    "muggy": {
        "label": "warm and humid, disease weather",
        "moisture_start": 50,
        "moisture_end": 47,
        "npk": (72, 33, 165),
        "temp": (23, 29),
        "humidity": (82, 94),
        "rain": 3.5,
    },
}

# Dealt out in order so a seeded database shows every kind of advice at once.
SCENARIO_ROTATION = ["dry", "hungry", "wet", "muggy", "healthy"]

# Soil profile defaults per soil type. pH is the one the engine reads.
SOIL_DEFAULTS = {
    "clay": {"texture": "Fine, sticky when wet", "color": "Dark grey", "ph": 7.9, "organic": 2.4, "salinity": 0.6},
    "sandy": {"texture": "Coarse, free-draining", "color": "Pale brown", "ph": 5.4, "organic": 1.1, "salinity": 0.3},
    "loam": {"texture": "Crumbly, well structured", "color": "Brown", "ph": 6.7, "organic": 3.2, "salinity": 0.4},
    "loamy": {"texture": "Crumbly, well structured", "color": "Brown", "ph": 6.6, "organic": 3.1, "salinity": 0.4},
}
DEFAULT_SOIL = {"texture": "Mixed", "color": "Brown", "ph": 6.8, "organic": 2.6, "salinity": 0.4}

# Growth stage + days-to-harvest per scenario slot, so one farm always sits in
# the harvest window and one is mid-season.
CROP_STAGES = [
    ("Flowering", 46),
    ("Grain filling", 21),
    ("Vegetative", 78),
    ("Ripening", 5),
    ("Vegetative", 63),
]


def _lerp(start, end, fraction):
    return start + (end - start) * fraction


class Command(BaseCommand):
    help = "Seed soil profiles, crops and a week of sensor readings per farm."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=7, help="History length in days (default 7).")
        parser.add_argument("--interval", type=int, default=3, help="Hours between readings (default 3).")
        parser.add_argument("--farm", help="Seed one farm by name instead of all of them.")
        parser.add_argument(
            "--scenario",
            choices=sorted(SCENARIOS),
            help="Force one scenario for every farm seeded.",
        )
        parser.add_argument("--reset", action="store_true", help="Delete existing sensor readings first.")
        parser.add_argument(
            "--no-agronomy",
            action="store_true",
            help="Skip soil profiles and crops - seed readings only.",
        )
        parser.add_argument("--seed", type=int, default=42, help="RNG seed, for repeatable output.")

    def handle(self, *args, **options):
        rng = random.Random(options["seed"])

        farms = Farm.objects.all().order_by("id")
        if options["farm"]:
            farms = farms.filter(name=options["farm"])
            if not farms.exists():
                raise CommandError(f"No farm named {options['farm']!r}.")
        if not farms.exists():
            raise CommandError("No farms in the database - run seed_farms first.")

        if options["reset"]:
            deleted, _ = SensorData.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} existing sensor readings."))

        totals = {"readings": 0, "soils": 0, "crops": 0, "skipped": 0}

        for index, farm in enumerate(farms):
            scenario_name = options["scenario"] or SCENARIO_ROTATION[index % len(SCENARIO_ROTATION)]
            scenario = SCENARIOS[scenario_name]

            robot = Robot.objects.filter(
                Q(farm=farm.name) | Q(id__in=list(farm.assigned_robots or []))
            ).first()
            if robot is None:
                self.stdout.write(
                    self.style.NOTICE(f"  {farm.name}: no robot assigned - no readings to seed.")
                )
                totals["skipped"] += 1
            else:
                count = self._seed_readings(farm, robot, scenario, options, rng)
                totals["readings"] += count
                self.stdout.write(
                    f"  {farm.name}: {count} readings from {robot.id} "
                    f"({scenario_name} - {scenario['label']})"
                )

            if options["no_agronomy"]:
                continue
            totals["soils"] += int(self._ensure_soil(farm, scenario))
            totals["crops"] += int(self._ensure_crop(farm, index))

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSeeded {totals['readings']} readings, {totals['soils']} soil profiles "
                f"and {totals['crops']} crops across {farms.count()} farm(s)."
                + (f" {totals['skipped']} farm(s) skipped - no robot." if totals["skipped"] else "")
            )
        )
        self.stdout.write("Next: python manage.py run_advisory")

    def _seed_readings(self, farm, robot, scenario, options, rng):
        """Walk backwards from now, one sample every `interval` hours."""
        now = timezone.now()
        span_hours = options["days"] * 24
        interval = max(options["interval"], 1)
        steps = span_hours // interval

        temp_lo, temp_hi = scenario["temp"]
        hum_lo, hum_hi = scenario["humidity"]
        n_target, p_target, k_target = scenario["npk"]

        rows = []
        for step in range(steps + 1):
            hours_ago = span_hours - step * interval
            recorded_at = now - timedelta(hours=hours_ago)
            # 0 at the oldest sample, 1 at the newest.
            progress = step / steps if steps else 1

            # Air temperature swings over the day; peak mid-afternoon.
            hour = recorded_at.astimezone(timezone.get_current_timezone()).hour
            day_curve = math.sin((hour - 9) / 24 * 2 * math.pi)
            temp = _lerp(temp_lo, temp_hi, 0.5 + 0.5 * day_curve) + rng.uniform(-1.2, 1.2)
            # Humidity moves opposite to temperature.
            humidity = _lerp(hum_hi, hum_lo, 0.5 + 0.5 * day_curve) + rng.uniform(-3, 3)

            moisture = _lerp(
                scenario["moisture_start"], scenario["moisture_end"], progress
            ) + rng.uniform(-1.5, 1.5)

            # Nutrients drift slowly towards the scenario target - crops draw
            # them down over a season, they do not jump around hourly.
            drift = 1 + rng.uniform(-0.04, 0.04)
            rows.append(
                SensorData(
                    robot=robot,
                    temperature=round(temp, 1),
                    humidity=round(min(max(humidity, 5), 100), 1),
                    soil_moisture=round(min(max(moisture, 3), 95), 1),
                    # Soil lags the air and swings far less.
                    soil_temperature=round(temp - rng.uniform(2.5, 5.5), 1),
                    nitrogen=round(_lerp(n_target * 1.25, n_target, progress) * drift, 1),
                    phosphorus=round(_lerp(p_target * 1.2, p_target, progress) * drift, 1),
                    potassium=round(_lerp(k_target * 1.15, k_target, progress) * drift, 1),
                    # Lux: dark at night, bright at midday.
                    light_intensity=round(max(0, 62000 * math.sin(max(hour - 6, 0) / 12 * math.pi)), 0),
                    wind_speed=round(rng.uniform(3, 18), 1),
                    rainfall=round(max(0, scenario["rain"] * rng.uniform(0, 1.6)), 1),
                    sensor_status="Active",
                    recorded_at=recorded_at,
                )
            )

        SensorData.objects.bulk_create(rows)
        return len(rows)

    def _ensure_soil(self, farm, scenario):
        """Give the farm a soil profile if it has none - the pH rules need it."""
        if hasattr(farm, "soil_profile"):
            return False

        soil_name = (farm.soil or "Loam").strip()
        defaults = SOIL_DEFAULTS.get(soil_name.lower(), DEFAULT_SOIL)
        # The Soil model only accepts Clay/Sandy/Loamy.
        soil_type = {"loam": "Loamy", "sand": "Sandy"}.get(
            soil_name.lower(), soil_name.title()
        )
        if soil_type not in dict(Soil.SOIL_TYPES):
            soil_type = "Loamy"

        n, p, k = scenario["npk"]
        Soil.objects.create(
            farm=farm,
            soil_type=soil_type,
            texture=defaults["texture"],
            color=defaults["color"],
            ph_value=defaults["ph"],
            nitrogen=n,
            phosphorus=p,
            potassium=k,
            organic_matter=defaults["organic"],
            salinity=defaults["salinity"],
            last_test_date=timezone.localdate() - timedelta(days=30),
        )
        return True

    def _ensure_crop(self, farm, index):
        """One active crop, so the harvest rules have a date to work from."""
        if farm.crops.filter(status="Active").exists():
            return False

        crop_name = (farm.crop or "").strip()
        if not crop_name:
            return False

        stage, days_to_harvest = CROP_STAGES[index % len(CROP_STAGES)]
        today = timezone.localdate()
        Crop.objects.create(
            farm=farm,
            crop_name=crop_name,
            crop_variety=f"{crop_name} - local variety",
            sowing_date=today - timedelta(days=120 - days_to_harvest),
            expected_harvest_date=today + timedelta(days=days_to_harvest),
            growth_stage=stage,
            plant_count=12000,
            status="Active",
        )
        return True
