"""Seed the database with the sample farms the frontend used to hard-code.

Usage:
    python manage.py seed_farms          # add farms only if none exist
    python manage.py seed_farms --reset  # wipe farms first, then reseed
"""

from django.core.management.base import BaseCommand

from core.models import Farm


FARMS = [
    {
        "name": "Green Valley Farm", "owner": "John Smith", "crop": "Wheat",
        "crop_types": "Wheat, Barley", "soil": "Clay", "robot": "AgriBot-001",
        "status": "Active", "size": "120 acres", "devices": "3",
        "coordinates": [{"lat": 36.7783, "lng": -119.4179}, {"lat": 36.7850, "lng": -119.4100}, {"lat": 36.7720, "lng": -119.4050}],
    },
    {
        "name": "Sunrise Orchards", "owner": "Sarah Johnson", "crop": "Apples",
        "crop_types": "Apples, Pears", "soil": "Loam", "robot": "AgriBot-002",
        "status": "Active", "size": "85 acres", "devices": "2",
        "coordinates": [{"lat": 47.7511, "lng": -120.7401}, {"lat": 47.7580, "lng": -120.7320}, {"lat": 47.7450, "lng": -120.7280}],
    },
    {
        "name": "Golden Harvest", "owner": "Michael Brown", "crop": "Corn",
        "crop_types": "Corn, Soybeans", "soil": "Sandy", "robot": "AgriBot-003",
        "status": "Active", "size": "200 acres", "devices": "4",
        "coordinates": [{"lat": 41.8781, "lng": -93.0977}, {"lat": 41.8850, "lng": -93.0900}, {"lat": 41.8720, "lng": -93.0850}],
    },
    {
        "name": "Maple Ridge Farm", "owner": "John Smith", "crop": "Soybeans",
        "crop_types": "Soybeans, Wheat", "soil": "Loam", "robot": "AgriBot-004",
        "status": "Active", "size": "150 acres", "devices": "2",
        "coordinates": [{"lat": 40.6331, "lng": -89.3985}, {"lat": 40.6400, "lng": -89.3900}, {"lat": 40.6270, "lng": -89.3850}],
    },
    {
        "name": "River Bend Agriculture", "owner": "Emily Davis", "crop": "Rice",
        "crop_types": "Rice, Corn", "soil": "Clay", "robot": "AgriBot-005",
        "status": "Active", "size": "180 acres", "devices": "3",
        "coordinates": [{"lat": 34.7465, "lng": -92.2896}, {"lat": 34.7530, "lng": -92.2820}, {"lat": 34.7400, "lng": -92.2770}],
    },
    {
        "name": "Highland Crops", "owner": "David Wilson", "crop": "Corn",
        "crop_types": "Corn, Wheat", "soil": "Loam", "robot": "AgriBot-006",
        "status": "Active", "size": "220 acres", "devices": "5",
        "coordinates": [{"lat": 41.4925, "lng": -99.9018}, {"lat": 41.4990, "lng": -99.8940}, {"lat": 41.4860, "lng": -99.8890}],
    },
    {
        "name": "Coastal Farms", "owner": "Sarah Johnson", "crop": "Strawberries",
        "crop_types": "Strawberries, Tomatoes", "soil": "Sandy", "robot": "AgriBot-007",
        "status": "Active", "size": "60 acres", "devices": "2",
        "coordinates": [{"lat": 44.9429, "lng": -123.0351}, {"lat": 44.9490, "lng": -123.0270}, {"lat": 44.9370, "lng": -123.0220}],
    },
    {
        "name": "Valley View Ranch", "owner": "Michael Brown", "crop": "Alfalfa",
        "crop_types": "Alfalfa, Hay", "soil": "Loam", "robot": "AgriBot-008",
        "status": "Active", "size": "300 acres", "devices": "4",
        "coordinates": [{"lat": 31.9686, "lng": -99.9018}, {"lat": 31.9750, "lng": -99.8940}, {"lat": 31.9620, "lng": -99.8890}],
    },
]


class Command(BaseCommand):
    help = "Seed the database with sample farms."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing farms before seeding.",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            deleted, _ = Farm.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted existing farms ({deleted} rows)."))

        if Farm.objects.exists():
            self.stdout.write(
                self.style.NOTICE(
                    "Farms already exist — skipping. Use --reset to reseed."
                )
            )
            return

        created = Farm.objects.bulk_create([Farm(**data) for data in FARMS])
        self.stdout.write(
            self.style.SUCCESS(f"Seeded {len(created)} farms successfully.")
        )
