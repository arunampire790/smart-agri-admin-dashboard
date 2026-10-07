"""The pairing handshake between a farmer's QR code and a physical robot.

The flow this supports, end to end:

  1. Admin assigns ROB-0001 to a farmer in the dashboard.
  2. Server builds one signed payload for that (robot, farmer) pair.
  3. The *farmer* gets it as a QR code - printed, or on their phone.
     The *robot* gets the identical string flashed into its config, along
     with a device_key that never leaves the machine.
  4. In the field the robot's camera reads the farmer's QR and compares the
     scanned string against the one it was given. Same string, same pair.
  5. Only then does it call the server, which re-checks the signature and
     the database rather than taking the robot's word for it.

Step 4 is a string comparison on purpose: the robot may be standing in a
field with no signal, and "is this the farmer I was built for" has to be
answerable without a network. Step 5 exists because that local check is
only as trustworthy as the robot's own firmware.

The signature is what stops a forged QR. Robot ids run ROB-0001, ROB-0002...
and farmer ids are small integers, so anyone can guess a plausible pair -
but not sign one, because the HMAC key is Django's SECRET_KEY and stays on
the server.
"""

import hmac
import json
from hashlib import sha256

from django.conf import settings

# Bumped if the field layout below ever changes. A robot flashed with v1
# firmware will refuse a v2 payload outright rather than mis-parse it.
PAYLOAD_VERSION = 1

# 32 hex chars = 128 bits. Full SHA-256 would be 64, which pushes the QR into
# a denser version that cheap robot cameras struggle to read in daylight.
SIGNATURE_LENGTH = 32

# Keys are terse for the same reason - every character is QR modules.
#   v   payload version      rid  robot id
#   fid farmer id            tok  the robot's single-use pair_token
#   sig HMAC over the above
_SIGNED_FIELDS = ("v", "rid", "fid", "tok")


class PairPayloadError(Exception):
    """Raised when a payload is malformed, unsigned, or signed wrong."""


def _canonical(payload):
    """The exact bytes the signature covers.

    Built field by field in a fixed order rather than by dumping the dict,
    so that a robot re-ordering keys or adding whitespace on the way back
    still produces the same signature.
    """
    parts = [f"{key}={payload[key]}" for key in _SIGNED_FIELDS]
    return "|".join(parts).encode("utf-8")


def _sign(payload):
    digest = hmac.new(
        settings.SECRET_KEY.encode("utf-8"), _canonical(payload), sha256
    ).hexdigest()
    return digest[:SIGNATURE_LENGTH]


def build_pair_payload(robot, farmer_id):
    """The dict that becomes both the farmer's QR and the robot's config.

    Takes the farmer's id rather than the object: the robot list builds one
    of these per row and already has the ids to hand, and fetching a whole
    Farmer just to read `.id` off it would be a query per robot.

    Callers hand the result to `encode_pair_payload` for the string that gets
    displayed and flashed - the two must be byte-identical or the robot's
    offline comparison fails.
    """
    if not robot.pair_token:
        raise PairPayloadError(
            "This robot has no active pair token. It is already paired, or "
            "was never assigned to a farmer."
        )

    payload = {
        "v": PAYLOAD_VERSION,
        "rid": robot.id,
        "fid": int(farmer_id),
        "tok": robot.pair_token,
    }
    payload["sig"] = _sign(payload)
    return payload


def encode_pair_payload(payload):
    """Compact JSON - no spaces, keys in our order, so it round-trips exactly."""
    return json.dumps(payload, separators=(",", ":"), sort_keys=False)


def decode_pair_payload(raw):
    """Parse whatever the robot read off the QR.

    Accepts either the JSON string or an already-parsed dict, because a robot
    may post the scanned text verbatim or parse it first.
    """
    if isinstance(raw, dict):
        payload = raw
    else:
        try:
            payload = json.loads(raw)
        except (TypeError, ValueError):
            raise PairPayloadError("This QR code could not be read.")

    if not isinstance(payload, dict):
        raise PairPayloadError("This QR code could not be read.")
    return payload


def verify_pair_payload(payload):
    """Check shape, version and signature. Returns (robot_id, farmer_id).

    Says nothing about whether the pair is *current* - that is a database
    question, answered by the view. This only establishes that the server
    issued this payload and nobody edited it since.
    """
    missing = [key for key in _SIGNED_FIELDS if key not in payload]
    if missing or "sig" not in payload:
        raise PairPayloadError("This QR code is incomplete.")

    if payload["v"] != PAYLOAD_VERSION:
        raise PairPayloadError(
            "This QR code was made for a different version of the app."
        )

    # compare_digest, not ==, so a forger cannot narrow the signature down
    # one character at a time by timing the response.
    if not hmac.compare_digest(str(payload["sig"]), _sign(payload)):
        raise PairPayloadError("This QR code is not genuine.")

    try:
        farmer_id = int(payload["fid"])
    except (TypeError, ValueError):
        raise PairPayloadError("This QR code is incomplete.")

    return str(payload["rid"]), farmer_id
