"""How a physical robot proves who it is.

People sign in with a password and carry a JWT. A robot cannot: there is
nobody at the keyboard, and it has to come back after a power cut without
help. So it carries a long random `device_key`, flashed in at provisioning
and sent on every request:

    Authorization: Device <key>

The robot this resolves to is attached as `request.robot`, and it is the only
thing the device endpoints trust. A robot may *say* it is ROB-0007 in a JSON
body; whether it really is depends on the key, and the views compare the two.

Deliberately not a Django user. A robot has no profile, no farms and no
password, and giving it a row in auth_user would mean every "who is signed
in" check downstream has to remember that some users are machines.
"""

from django.utils import timezone
from rest_framework import authentication, exceptions

from .models import Robot

KEYWORD = "Device"


class DeviceIdentity:
    """The stand-in `request.user` for an authenticated robot.

    Duck-types the parts of Django's user that DRF touches. `is_staff` is
    False and stays False, so if one of these ever reaches a dashboard
    endpoint by mistake, core.permissions.IsAdmin turns it away.
    """

    is_authenticated = True
    is_anonymous = False
    is_active = True
    is_staff = False
    is_superuser = False

    def __init__(self, robot):
        self.robot = robot

    def __str__(self):
        return f"robot:{self.robot.id}"


class DeviceAuthentication(authentication.BaseAuthentication):
    """Reads `Authorization: Device <key>` and resolves it to a Robot."""

    keyword = KEYWORD

    def authenticate(self, request):
        header = authentication.get_authorization_header(request).split()

        # Not our scheme - hand back None so JWT/session auth get their turn.
        # Device endpoints list this class first, but the dashboard's own
        # auth still has to work if one is ever mounted more broadly.
        if not header or header[0].lower() != self.keyword.lower().encode():
            return None

        if len(header) == 1:
            raise exceptions.AuthenticationFailed("No device key supplied.")
        if len(header) > 2:
            raise exceptions.AuthenticationFailed(
                "Device key must not contain spaces."
            )

        try:
            key = header[1].decode("utf-8")
        except UnicodeError:
            raise exceptions.AuthenticationFailed("Malformed device key.")

        # An unsaved or hand-edited robot can carry device_key="". Without
        # this guard an empty header would match it and authenticate as that
        # machine, so refuse blank keys before they reach the query.
        if not key.strip():
            raise exceptions.AuthenticationFailed("No device key supplied.")

        robot = Robot.objects.filter(device_key=key).first()
        if robot is None:
            raise exceptions.AuthenticationFailed("Unrecognised device key.")

        # Cheap heartbeat: any call at all counts as "still alive", which is
        # what the stale-data advisory rule and the dashboard's live dot read.
        Robot.objects.filter(pk=robot.pk).update(last_seen_at=timezone.now())

        return (DeviceIdentity(robot), robot)

    def authenticate_header(self, request):
        # Makes DRF answer 401 (bad key) rather than 403 (no key at all).
        return self.keyword


def device_from_request(request):
    """The Robot behind this request, or None if a human sent it.

    DRF stores whatever `authenticate` returned as request.user/request.auth,
    so this is the one place that knows which. Callers get None for admins and
    customers, which is what the device permission and views branch on.
    """
    user = getattr(request, "user", None)
    return user.robot if isinstance(user, DeviceIdentity) else None
