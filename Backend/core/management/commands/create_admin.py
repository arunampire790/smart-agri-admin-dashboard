"""Create the dashboard admin login account.

SimpleJWT authenticates against Django's User model using username + password,
so the frontend sends the login email as the username. This command creates
that account so login works out of the box.

There is no built-in default password. Leave --password off and a strong
random one is generated and printed once; pass your own and it has to pass
Django's password rules (8+ characters, not too common, not all digits).

Usage:
    python manage.py create_admin                       # random password, printed
    python manage.py create_admin --email a@b.com --password "a-strong-pass"
    python manage.py create_admin --reset               # reset password if user exists
"""

import secrets

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError

DEFAULT_EMAIL = "admin@smartagri.com"


class Command(BaseCommand):
    help = "Create (or reset) the admin login account used by the dashboard."

    def add_arguments(self, parser):
        parser.add_argument("--email", default=DEFAULT_EMAIL, help="Login email (stored as username).")
        parser.add_argument("--password", help="Login password. Omit to generate a random one.")
        parser.add_argument("--reset", action="store_true", help="Reset the password if the user already exists.")

    def handle(self, *args, **options):
        User = get_user_model()
        email = options["email"]
        password = options["password"]
        reset = options["reset"]

        generated = password is None
        if generated:
            password = secrets.token_urlsafe(12)
        else:
            try:
                validate_password(password)
            except ValidationError as exc:
                raise CommandError("Password too weak: " + " ".join(exc.messages))

        user = User.objects.filter(username=email).first()
        if user:
            if reset:
                user.set_password(password)
                user.is_staff = True
                user.is_superuser = True
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Reset password for existing admin '{email}'."))
                self._show_password(password, generated)
            else:
                self.stdout.write(self.style.WARNING(f"Admin '{email}' already exists. Use --reset to change the password."))
            return

        User.objects.create_superuser(username=email, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f"Created admin '{email}'. Log in with this email + password."))
        self._show_password(password, generated)

    def _show_password(self, password, generated):
        if generated:
            self.stdout.write(f"Password: {password}")
            self.stdout.write("Save it now - it is not shown again. Change it under Settings after signing in.")
