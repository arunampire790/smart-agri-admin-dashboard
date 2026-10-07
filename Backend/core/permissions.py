from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Dashboard-only access.

    Everything behind the admin panel - customers, farms, robots, tasks - is
    staff-only. Customer accounts are ordinary non-staff Django users; the
    handful of things they may touch (their own profile, connecting a robot
    they scanned) opt out of this with their own permission_classes.
    """

    message = "Only admin accounts can use this endpoint."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


class IsMasterAdmin(BasePermission):
    """Only master admins (Django superusers) - e.g. managing employees."""

    message = "Only a master admin can do this."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_staff and user.is_superuser)


class IsDevice(BasePermission):
    """Robot-only access.

    Paired with core.authentication.DeviceAuthentication, which is what put
    the robot on the request in the first place. Asking for *that* - rather
    than for any signed-in user - is what keeps an admin's browser session
    from posting telemetry as if it were a machine.
    """

    message = "This endpoint is for robots. Send Authorization: Device <key>."

    def has_permission(self, request, view):
        from .authentication import device_from_request

        return device_from_request(request) is not None
