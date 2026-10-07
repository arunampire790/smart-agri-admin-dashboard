"""Give every robot that already exists a device key.

Robot.save() issues one to anything created from now on, but rows already in
the table were written before the field existed and would come out with the
empty-string default. A blank key is worse than no key: DeviceAuthentication
refuses blanks outright, so those robots could never call home, and they are
exactly the ones already sitting in fields.

Keys are per-row, not one shared value - the whole point of the key is that
it tells one machine from another.
"""

import secrets

from django.db import migrations


def issue_device_keys(apps, schema_editor):
    Robot = apps.get_model("core", "Robot")
    # Historical models have no custom save(), so set the key explicitly.
    for robot in Robot.objects.filter(device_key=""):
        robot.device_key = secrets.token_urlsafe(32)
        robot.save(update_fields=["device_key"])


def clear_device_keys(apps, schema_editor):
    # Reversing drops the keys rather than restoring anything: they were
    # random, so there is no earlier value to go back to.
    apps.get_model("core", "Robot").objects.update(device_key="")


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0009_robot_device_key_robot_last_seen_at"),
    ]

    operations = [
        migrations.RunPython(issue_device_keys, clear_device_keys),
    ]
