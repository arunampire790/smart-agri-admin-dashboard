"""Seed the database with the sample robots + assignment history the
frontend used to hard-code.

Usage:
    python manage.py seed_robots          # add only if none exist
    python manage.py seed_robots --reset  # wipe robots+history first, then reseed
"""

from django.core.management.base import BaseCommand

from core.models import Robot, RobotHistory


ROBOTS = [
    {"id": "ROB-0001", "name": "AgriBot Alpha", "model": "AB-X1000", "status": "Active", "farmer": "John Smith", "farm": "Green Valley Farm", "battery": 85, "registered": "2025-12-15", "notes": ""},
    {"id": "ROB-0002", "name": "AgriBot Beta", "model": "AB-X1000", "status": "Assigned", "farmer": "Sarah Johnson", "farm": "Sunrise Orchards", "battery": 62, "registered": "2026-01-10", "notes": ""},
    {"id": "ROB-0003", "name": "AgriBot Gamma", "model": "AB-X2000", "status": "Maintenance", "farmer": "Michael Brown", "farm": "Golden Harvest", "battery": 45, "registered": "2025-11-20", "notes": ""},
    {"id": "ROB-0004", "name": "AgriBot Delta", "model": "AB-X1000", "status": "Active", "farmer": "John Smith", "farm": "Maple Ridge Farm", "battery": 92, "registered": "2025-10-12", "notes": ""},
    {"id": "ROB-0005", "name": "AgriBot Epsilon", "model": "AB-X1000", "status": "Available", "farmer": None, "farm": "", "battery": 0, "registered": "2026-03-01", "notes": ""},
    {"id": "ROB-0006", "name": "AgriBot Zeta", "model": "AB-X2000", "status": "Available", "farmer": None, "farm": "", "battery": 0, "registered": "2026-03-15", "notes": ""},
    {"id": "ROB-0007", "name": "AgriBot Eta", "model": "AB-X1000", "status": "Inactive", "farmer": "Emily Davis", "farm": "", "battery": 0, "registered": "2026-02-05", "notes": ""},
    {"id": "ROB-0008", "name": "AgriBot Theta", "model": "AB-X2000", "status": "Lost", "farmer": None, "farm": "", "battery": 0, "registered": "2025-09-30", "notes": ""},
]

HISTORY = [
    {"robot_id": "ROB-0001", "action": "Assigned", "farmer": "John Smith", "by": "Admin User", "date": "2025-12-15"},
    {"robot_id": "ROB-0002", "action": "Assigned", "farmer": "Sarah Johnson", "by": "Admin User", "date": "2026-01-10"},
    {"robot_id": "ROB-0003", "action": "Assigned", "farmer": "Michael Brown", "by": "Admin User", "date": "2025-11-20"},
    {"robot_id": "ROB-0003", "action": "Maintenance", "farmer": "Michael Brown", "by": "Admin User", "date": "2026-03-01"},
    {"robot_id": "ROB-0007", "action": "Assigned", "farmer": "Emily Davis", "by": "Admin User", "date": "2026-02-05"},
    {"robot_id": "ROB-0007", "action": "Deactivated", "farmer": "Emily Davis", "by": "Admin User", "date": "2026-04-01"},
]


class Command(BaseCommand):
    help = "Seed the database with sample robots and assignment history."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing robots and history before seeding.",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            r_deleted, _ = Robot.objects.all().delete()
            h_deleted, _ = RobotHistory.objects.all().delete()
            self.stdout.write(
                self.style.WARNING(
                    f"Deleted existing robots ({r_deleted}) and history ({h_deleted})."
                )
            )

        if Robot.objects.exists():
            self.stdout.write(
                self.style.NOTICE("Robots already exist — skipping. Use --reset to reseed.")
            )
            return

        Robot.objects.bulk_create([Robot(**data) for data in ROBOTS])
        RobotHistory.objects.bulk_create([RobotHistory(**data) for data in HISTORY])
        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(ROBOTS)} robots and {len(HISTORY)} history entries."
            )
        )
