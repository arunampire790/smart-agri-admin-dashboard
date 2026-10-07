"""Employees: the people who sign in to the admin dashboard.

Each employee is a staff Django login. Adding one here creates the account
(with a password the master admin sets and hands over); there is no other
way in. Roles:

    Master Admin - Django superuser. Everything, including this page.
    Admin        - the whole dashboard except managing employees.
    Employee     - same access as Admin for now; kept separate so the two
                   can be told apart (and limited differently later).

Setting someone Inactive switches off their login; Django and SimpleJWT
both refuse inactive users, so existing sessions stop working too.
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers, viewsets
from rest_framework.exceptions import ValidationError

from .account_views import staff_role
from .models import StaffProfile
from .permissions import IsMasterAdmin

User = get_user_model()

ROLE_LABELS = {"masterAdmin": "Master Admin", "admin": "Admin", "employee": "Employee"}
ROLE_KEYS = {label: key for key, label in ROLE_LABELS.items()}


class EmployeeSerializer(serializers.Serializer):
    """Shaped like the Employees table: name, email, phone, role, status, joined."""

    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=300)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, allow_blank=True, required=False)
    role = serializers.ChoiceField(choices=list(ROLE_KEYS))
    status = serializers.ChoiceField(choices=["Active", "Inactive"], required=False)
    joined = serializers.SerializerMethodField()
    # Required when adding; on edit, send it only to reset the password.
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def get_joined(self, user):
        return user.date_joined.strftime("%Y-%m-%d")

    def to_representation(self, user):
        profile = getattr(user, "staff_profile", None)
        return {
            "id": user.id,
            "name": user.get_full_name() or user.email or user.username,
            "email": user.email or user.username,
            "phone": profile.phone if profile else "",
            "role": ROLE_LABELS[staff_role(user)],
            "status": "Active" if user.is_active else "Inactive",
            "joined": self.get_joined(user),
        }

    def validate_email(self, value):
        email = value.strip().lower()
        taken = User.objects.filter(username__iexact=email) | User.objects.filter(
            email__iexact=email
        )
        if self.instance is not None:
            taken = taken.exclude(pk=self.instance.pk)
        if taken.exists():
            raise serializers.ValidationError("Another account already uses this email.")
        return email

    def validate_password(self, value):
        if value:
            try:
                validate_password(value)
            except DjangoValidationError as exc:
                raise serializers.ValidationError(list(exc.messages))
        return value

    def validate(self, attrs):
        if self.instance is None and not attrs.get("password"):
            raise ValidationError(
                {"password": ["A password is required so they can sign in."]}
            )

        # Nobody can lock themselves out: your own role and status are fixed
        # here (another master admin can change them).
        me = self.context["request"].user
        if self.instance is not None and self.instance.pk == me.pk:
            if "role" in attrs and ROLE_KEYS[attrs["role"]] != staff_role(me):
                raise ValidationError({"role": ["You can't change your own role."]})
            if attrs.get("status") == "Inactive":
                raise ValidationError({"status": ["You can't deactivate your own account."]})
        return attrs

    @staticmethod
    def _apply(user, data):
        if "name" in data:
            first, _, last = data["name"].strip().partition(" ")
            user.first_name, user.last_name = first, last.strip()
        if "email" in data:
            # The email is the login.
            user.email = user.username = data["email"]
        if "status" in data:
            user.is_active = data["status"] == "Active"
        if "role" in data:
            user.is_superuser = ROLE_KEYS[data["role"]] == "masterAdmin"
        if data.get("password"):
            user.set_password(data["password"])
        user.is_staff = True
        user.save()

        # Reuse the profile already loaded on `user` (select_related), so the
        # response built from it shows the new values, not the old ones.
        try:
            profile = user.staff_profile
        except StaffProfile.DoesNotExist:
            profile = StaffProfile(user=user)
            user.staff_profile = profile
        if "role" in data and ROLE_KEYS[data["role"]] != "masterAdmin":
            profile.role = ROLE_KEYS[data["role"]]
        if "phone" in data:
            profile.phone = data["phone"].strip()
        profile.save()
        return user

    def create(self, validated):
        with transaction.atomic():
            user = User(username=validated["email"])
            validated.setdefault("status", "Active")
            return self._apply(user, validated)

    def update(self, user, validated):
        with transaction.atomic():
            return self._apply(user, validated)


class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer
    permission_classes = [IsMasterAdmin]

    def get_queryset(self):
        return (
            User.objects.filter(is_staff=True)
            .select_related("staff_profile")
            .order_by("date_joined")
        )

    def perform_destroy(self, user):
        if user.pk == self.request.user.pk:
            raise ValidationError({"detail": "You can't delete your own account."})
        user.delete()
