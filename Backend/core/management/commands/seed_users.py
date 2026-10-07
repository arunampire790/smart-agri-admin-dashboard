"""Seed the database with the sample customers the frontend used to hard-code.

Each one gets a real login, because that is the only way an account can come
into existence - customers never sign themselves up, the admin registers them
when they buy a robot.

Usage:
    python manage.py seed_users                       # add only if none exist
    python manage.py seed_users --reset               # wipe customers first
    python manage.py seed_users --password "a-strong-pass"   # set the shared password

Without --password a random shared password is generated and printed.
"""

import secrets

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.dateparse import parse_date
from django.utils.timezone import make_aware

from datetime import datetime, time

from core.models import Farmer

USERS = [
    {"full_name": "John Smith", "email": "john.smith@example.com", "mobile": "+1-555-0101", "status": "Active", "joined": "2025-12-15"},
    {"full_name": "Sarah Johnson", "email": "sarah.j@example.com", "mobile": "+1-555-0102", "status": "Active", "joined": "2026-01-10"},
    {"full_name": "Michael Brown", "email": "michael.b@example.com", "mobile": "+1-555-0103", "status": "Active", "joined": "2025-11-20"},
    {"full_name": "Emily Davis", "email": "emily.davis@example.com", "mobile": "+1-555-0104", "status": "Inactive", "joined": "2026-02-05"},
    {"full_name": "David Wilson", "email": "david.w@example.com", "mobile": "+1-555-0105", "status": "Active", "joined": "2025-10-12"},
]


class Command(BaseCommand):
    help = "Seed the database with sample customer accounts (profile + login)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing customers (and their logins) before seeding.",
        )
        parser.add_argument(
            "--password",
            help="Password given to every seeded customer. Omit to generate one.",
        )

    def handle(self, *args, **options):
        User = get_user_model()
        password = options["password"]
        if password is None:
            password = secrets.token_urlsafe(12)
        else:
            try:
                validate_password(password)
            except ValidationError as exc:
                raise CommandError("Password too weak: " + " ".join(exc.messages))

        if options["reset"]:
            emails = list(Farmer.objects.values_list("email", flat=True))
            deleted, _ = Farmer.objects.all().delete()
            User.objects.filter(username__in=emails).delete()
            self.stdout.write(
                self.style.WARNING(f"Deleted existing customers ({deleted} rows).")
            )

        if Farmer.objects.exists():
            self.stdout.write(
                self.style.NOTICE(
                    "Customers already exist - skipping. Use --reset to reseed."
                )
            )
            return

        for data in USERS:
            joined = data.pop("joined")
            with transaction.atomic():
                login = User.objects.create_user(
                    username=data["email"],
                    email=data["email"],
                    first_name=data["full_name"],
                    password=password,
                    is_active=data["status"] == "Active",
                )
                farmer = Farmer.objects.create(auth_user=login, **data)
                # created_at is auto_now_add, so backdate it with an UPDATE to
                # keep the "Joined" dates the dashboard used to show.
                Farmer.objects.filter(pk=farmer.pk).update(
                    created_at=make_aware(
                        datetime.combine(parse_date(joined), time(12, 0))
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(USERS)} customers. Shared password: {password}"
            )
        )
