"""Create the dashboard admin login account.

SimpleJWT authenticates against Django's User model using username + password,
so the frontend sends the login email as the username. This command creates
that account so login works out of the box.

Usage:
    python manage.py create_admin                       # default demo admin
    python manage.py create_admin --email a@b.com --password secret
    python manage.py create_admin --reset               # reset password if user exists
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

DEFAULT_EMAIL = "admin@smartagri.com"
DEFAULT_PASSWORD = "admin123"


class Command(BaseCommand):
    help = "Create (or reset) the admin login account used by the dashboard."

    def add_arguments(self, parser):
        parser.add_argument("--email", default=DEFAULT_EMAIL, help="Login email (stored as username).")
        parser.add_argument("--password", default=DEFAULT_PASSWORD, help="Login password.")
        parser.add_argument("--reset", action="store_true", help="Reset the password if the user already exists.")

    def handle(self, *args, **options):
        User = get_user_model()
        email = options["email"]
        password = options["password"]
        reset = options["reset"]

        user = User.objects.filter(username=email).first()
        if user:
            if reset:
                user.set_password(password)
                user.is_staff = True
                user.is_superuser = True
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Reset password for existing admin '{email}'."))
            else:
                self.stdout.write(self.style.WARNING(f"Admin '{email}' already exists. Use --reset to change the password."))
            return

        User.objects.create_superuser(username=email, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f"Created admin '{email}'. Log in with this email + password."))
