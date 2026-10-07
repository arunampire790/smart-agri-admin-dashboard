"""The signed-in admin's own account, and "Forgot password".

Two halves:

* /auth/account/ and /auth/account/password/ - an admin reading and editing
  their own name, email, phone and password. Email is also the login (it is
  stored as the username), so changing it here changes how they sign in.

* /auth/password-reset/... - the logged-out flow behind "Forgot password?".
  A 6-digit code is emailed, checked, and then traded for a new password.
  These answer the same way whether or not the email belongs to an account,
  so the form can't be used to find out who has one.
"""

import logging
import secrets
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
    throttle_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from .models import PasswordResetCode, StaffProfile
from .permissions import IsAdmin

logger = logging.getLogger(__name__)
User = get_user_model()

# Don't send a second code to the same account within this window. The
# request still answers "sent", so a double-click doesn't look like an error.
RESEND_COOLDOWN = timedelta(seconds=60)

INVALID_CODE = "Invalid or expired code. Please request a new one."


def staff_role(user):
    """'masterAdmin' | 'admin' | 'employee' - what the dashboard calls it."""
    if user.is_superuser:
        return "masterAdmin"
    profile = getattr(user, "staff_profile", None)
    return profile.role if profile else "admin"


def _password_errors(password, user):
    """Django's password rules (length, too common, all digits, ...)."""
    try:
        validate_password(password, user=user)
    except DjangoValidationError as exc:
        return list(exc.messages)
    return []


# --- Own account ---------------------------------------------------------


class AccountSerializer(serializers.Serializer):
    name = serializers.SerializerMethodField()
    first_name = serializers.CharField(max_length=150, allow_blank=True, required=False)
    last_name = serializers.CharField(max_length=150, allow_blank=True, required=False)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(max_length=20, allow_blank=True, required=False)
    role = serializers.SerializerMethodField()
    # Settings > Notifications
    notify_email = serializers.BooleanField(required=False)
    notify_task_assignments = serializers.BooleanField(required=False)
    notify_robot_alerts = serializers.BooleanField(required=False)

    # Stored on StaffProfile rather than the User row.
    PROFILE_FIELDS = (
        "phone",
        "notify_email",
        "notify_task_assignments",
        "notify_robot_alerts",
    )

    def get_name(self, user):
        return user.get_full_name() or user.email or user.username

    def get_role(self, user):
        return staff_role(user)

    def to_representation(self, user):
        data = super().to_representation(user)
        profile = getattr(user, "staff_profile", None) or StaffProfile(user=user)
        for field in self.PROFILE_FIELDS:
            data[field] = getattr(profile, field)
        return data

    def validate_email(self, value):
        email = value.strip().lower()
        taken = (
            User.objects.filter(username__iexact=email)
            | User.objects.filter(email__iexact=email)
        ).exclude(pk=self.instance.pk)
        if taken.exists():
            raise serializers.ValidationError("Another account already uses this email.")
        return email

    def update(self, user, validated):
        with transaction.atomic():
            for field in ("first_name", "last_name"):
                if field in validated:
                    setattr(user, field, validated[field].strip())
            if "email" in validated:
                # The email is the login, so the username follows it.
                user.email = validated["email"]
                user.username = validated["email"]
            user.save()
            changes = {f: validated[f] for f in self.PROFILE_FIELDS if f in validated}
            if changes:
                if "phone" in changes:
                    changes["phone"] = changes["phone"].strip()
                profile, _ = StaffProfile.objects.get_or_create(user=user)
                for field, value in changes.items():
                    setattr(profile, field, value)
                profile.save()
        return user


@api_view(["GET", "PATCH"])
@permission_classes([IsAdmin])
def account(request):
    """The signed-in admin's profile. PATCH saves any subset of fields."""
    if request.method == "GET":
        return Response(AccountSerializer(request.user).data)

    serializer = AccountSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(AccountSerializer(request.user).data)


@api_view(["POST"])
@permission_classes([IsAdmin])
def change_password(request):
    """Change the signed-in admin's password. Needs the current one."""
    user = request.user
    current = request.data.get("current_password") or ""
    new = request.data.get("new_password") or ""

    if not user.check_password(current):
        return Response(
            {"current_password": ["Current password is incorrect."]},
            status=status.HTTP_400_BAD_REQUEST,
        )
    errors = _password_errors(new, user)
    if errors:
        return Response({"new_password": errors}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new)
    user.save(update_fields=["password"])
    return Response(status=status.HTTP_204_NO_CONTENT)


# --- Forgot password -----------------------------------------------------


def _staff_user(email):
    """The active admin account behind this email, or None.

    Customers sign in elsewhere and never see this form, so only staff can
    reset from here.
    """
    email = (email or "").strip()
    if not email:
        return None
    return User.objects.filter(
        username__iexact=email, is_staff=True, is_active=True
    ).first()


def _live_code(user):
    """The newest unspent, unexpired code for this user, or None."""
    if user is None:
        return None
    return (
        PasswordResetCode.objects.filter(
            user=user, used_at__isnull=True, expires_at__gt=timezone.now()
        )
        .order_by("-created_at")
        .first()
    )


def _check_code(user, code):
    """Return the matching live code row, or None. Counts every guess."""
    row = _live_code(user)
    if row is None or row.attempts >= PasswordResetCode.MAX_ATTEMPTS:
        return None
    if check_password(str(code or "").strip(), row.code_hash):
        return row
    PasswordResetCode.objects.filter(pk=row.pk).update(attempts=row.attempts + 1)
    return None


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
def password_reset_request(request):
    """Email a 6-digit code. Always answers 200 so emails can't be probed."""
    user = _staff_user(request.data.get("email"))
    if user is not None:
        recent = PasswordResetCode.objects.filter(
            user=user, created_at__gt=timezone.now() - RESEND_COOLDOWN
        ).exists()
        if not recent:
            code = f"{secrets.randbelow(1_000_000):06d}"
            with transaction.atomic():
                # Only the newest code works; older ones stop the moment a new
                # one is issued.
                PasswordResetCode.objects.filter(user=user, used_at__isnull=True).update(
                    used_at=timezone.now()
                )
                row = PasswordResetCode.objects.create(
                    user=user,
                    code_hash=make_password(code),
                    expires_at=timezone.now()
                    + timedelta(minutes=PasswordResetCode.LIFETIME_MINUTES),
                )
            try:
                send_mail(
                    subject="Your Smart Agriculture password reset code",
                    message=(
                        f"Your password reset code is: {code}\n\n"
                        f"It expires in {PasswordResetCode.LIFETIME_MINUTES} minutes. "
                        "If you didn't ask to reset your password, you can ignore this email."
                    ),
                    from_email=None,
                    recipient_list=[user.email or user.username],
                )
            except Exception:
                # Mail settings are wrong or the server is down. Say so - a
                # silent 200 would leave the admin waiting for a code that
                # will never come. (This does reveal that the email is an
                # admin account, which is the lesser problem.)
                logger.exception("Could not send password reset email")
                # Drop the unsent code so the cooldown doesn't block a retry.
                row.delete()
                return Response(
                    {"detail": "Could not send the email right now. Please try again later."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
    return Response({"detail": "If that email has an account, a code has been sent."})


password_reset_request.cls.throttle_scope = "password_reset"


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
def password_reset_verify(request):
    """Check a code without spending it, so the form can move to step 3."""
    user = _staff_user(request.data.get("email"))
    if _check_code(user, request.data.get("code")) is None:
        return Response({"code": [INVALID_CODE]}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"detail": "Code is valid."})


password_reset_verify.cls.throttle_scope = "password_reset"


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
def password_reset_confirm(request):
    """Set a new password using a valid code. Spends the code."""
    user = _staff_user(request.data.get("email"))
    row = _check_code(user, request.data.get("code"))
    if row is None:
        return Response({"code": [INVALID_CODE]}, status=status.HTTP_400_BAD_REQUEST)

    new = request.data.get("new_password") or ""
    errors = _password_errors(new, user)
    if errors:
        return Response({"new_password": errors}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        user.set_password(new)
        user.save(update_fields=["password"])
        PasswordResetCode.objects.filter(user=user, used_at__isnull=True).update(
            used_at=timezone.now()
        )
    return Response({"detail": "Password has been reset."})


password_reset_confirm.cls.throttle_scope = "password_reset"
