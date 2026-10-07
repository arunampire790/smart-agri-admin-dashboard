import secrets

from django.conf import settings
from django.db import models

# Create your models here.

#Farmer
class Farmer(models.Model):
    """A robot customer.

    There is no public sign-up. When someone buys a robot the admin registers
    them here and hands over the credentials, so `auth_user` is the only login
    that can ever reach this customer's data.
    """

    STATUS = [
        ("Active", "Active"),
        ("Inactive", "Inactive"),
    ]

    full_name = models.CharField(max_length=100)

    email = models.EmailField(unique=True)

    mobile = models.CharField(max_length=15)

    address = models.TextField(blank=True, default="")

    status = models.CharField(max_length=20, choices=STATUS, default="Active")

    # The login the admin creates for this customer. Nullable so a profile can
    # exist before its credentials are issued.
    auth_user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="farmer_profile",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name
  
#Farm
class Farm(models.Model):

    STATUS = [
        ("Active", "Active"),
        ("Idle", "Idle"),
        ("Offline", "Offline"),
    ]

    name = models.CharField(max_length=200)

    # Owner is stored as the user's name (matches the frontend shape).
    # TODO: normalise to a ForeignKey(Farmer) in a later phase.
    owner = models.CharField(max_length=200)

    crop = models.CharField(max_length=200, blank=True, default="")

    crop_types = models.CharField(max_length=200, blank=True, default="")

    soil = models.CharField(max_length=50, blank=True, default="")

    # Comma-joined robot codes shown in the table.
    robot = models.CharField(max_length=200, blank=True, default="")

    # List of assigned robot ids, e.g. ["ROB-0001", "ROB-0002"].
    assigned_robots = models.JSONField(default=list, blank=True)

    status = models.CharField(max_length=20, choices=STATUS, default="Active")

    # Human-readable size, e.g. "120 acres".
    size = models.CharField(max_length=50, blank=True, default="")

    devices = models.CharField(max_length=10, blank=True, default="0")

    # Boundary polygon: [{"lat": .., "lng": ..}, ...].
    coordinates = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

#Soil
class Soil(models.Model):

    SOIL_TYPES = [
        ("Clay", "Clay"),
        ("Sandy", "Sandy"),
        ("Loamy", "Loamy"),
    ]

    farm = models.OneToOneField(
        Farm,
        on_delete=models.CASCADE,
        related_name="soil_profile"
    )

    soil_type = models.CharField(
        max_length=20,
        choices=SOIL_TYPES
    )

    texture = models.CharField(max_length=50)

    color = models.CharField(max_length=50)

    ph_value = models.FloatField()

    nitrogen = models.FloatField()

    phosphorus = models.FloatField()

    potassium = models.FloatField()

    organic_matter = models.FloatField()

    salinity = models.FloatField()

    last_test_date = models.DateField()

    def __str__(self):
        return f"{self.farm.farm_name} Soil"
    
#Crops
class Crop(models.Model):

    STATUS = [
        ("Active", "Active"),
        ("Harvested", "Harvested"),
    ]

    farm = models.ForeignKey(
        Farm,
        on_delete=models.CASCADE,
        related_name="crops"
    )

    crop_name = models.CharField(max_length=100)

    crop_variety = models.CharField(max_length=100)

    sowing_date = models.DateField()

    expected_harvest_date = models.DateField()

    growth_stage = models.CharField(max_length=100)

    plant_count = models.IntegerField()

    status = models.CharField(
        max_length=20,
        choices=STATUS
    )

    def __str__(self):
        return self.crop_name

#Robot
class Robot(models.Model):

    STATUS = [
        ("Active", "Active"),
        ("Assigned", "Assigned"),
        ("Available", "Available"),
        ("Maintenance", "Maintenance"),
        ("Inactive", "Inactive"),
        ("Lost", "Lost"),
    ]

    # Frontend-facing id, e.g. "ROB-0001". Used as the primary key so the
    # React code keeps working with the same identifier everywhere
    # (QR codes, farm assignment matching, generation).
    id = models.CharField(primary_key=True, max_length=20)

    name = models.CharField(max_length=120, blank=True, default="")

    model = models.CharField(max_length=100, blank=True, default="")

    status = models.CharField(max_length=20, choices=STATUS, default="Available")

    # Owner name string, or null when unassigned.
    farmer = models.CharField(max_length=200, blank=True, null=True)

    farm = models.CharField(max_length=200, blank=True, default="")

    battery = models.IntegerField(default=0)

    registered = models.DateField(null=True, blank=True)

    notes = models.TextField(blank=True, default="")

    # The secret shared by the farmer's QR code and the copy flashed into the
    # robot, so the robot can tell in the field whether the person in front of
    # it is the one it was built for. Single-use: pairing clears it. Robot ids
    # run ROB-0001, ROB-0002... and are trivially guessable, which is exactly
    # why the id alone is not enough to claim one.
    pair_token = models.CharField(max_length=64, blank=True, default="", db_index=True)

    paired_at = models.DateTimeField(null=True, blank=True)

    # The physical robot's own credential, sent as `Authorization: Device <key>`
    # on every call it makes. Unlike pair_token this is not single-use and is
    # never printed on anything - it identifies the machine for the rest of its
    # life, which is what lets the server reject telemetry claiming to be from
    # a robot it did not come from.
    device_key = models.CharField(max_length=64, blank=True, default="", db_index=True)

    # Last time this robot called home, on any endpoint. Drives the
    # "robot has not reported" advisory rule and the dashboard's live dot.
    last_seen_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Taking the farmer off puts the robot back on the shelf, so retire the
        # old pairing and let a fresh token be issued below.
        if not (self.farmer or "").strip() and self.paired_at is not None:
            self.paired_at = None
            self.pair_token = ""
        # Every unclaimed robot carries a token, so the farmer's QR can be
        # issued the moment the robot is assigned.
        if not self.pair_token and not self.paired_at:
            self.pair_token = secrets.token_urlsafe(24)
        # Issued once, at first save, and kept for the life of the machine -
        # regenerating it would lock out a robot already in a field.
        if not self.device_key:
            self.device_key = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.id

#Sensor Data
class SensorData(models.Model):

    robot = models.ForeignKey(
        Robot,
        on_delete=models.CASCADE,
        related_name="sensor_data"
    )

    temperature = models.FloatField()

    humidity = models.FloatField()

    soil_moisture = models.FloatField()

    soil_temperature = models.FloatField()

    nitrogen = models.FloatField()

    phosphorus = models.FloatField()

    potassium = models.FloatField()

    light_intensity = models.FloatField()

    wind_speed = models.FloatField()

    rainfall = models.FloatField()

    sensor_status = models.CharField(
        max_length=20,
        default="Active"
    )

    recorded_at = models.DateTimeField()

    def __str__(self):
        return f"{self.robot.robot_code} - {self.recorded_at}"

#Weather Data
class Weather(models.Model):

    farm = models.ForeignKey(
        Farm,
        on_delete=models.CASCADE,
        related_name="weather"
    )

    temperature = models.FloatField()

    humidity = models.FloatField()

    wind_speed = models.FloatField()

    rain_probability = models.FloatField()

    pressure = models.FloatField()

    weather_condition = models.CharField(max_length=50)

    uv_index = models.FloatField()

    # Day-by-day outlook straight from WeatherAPI, trimmed to the fields the
    # rules read: [{"date", "max_temp", "min_temp", "chance_of_rain",
    # "total_precip_mm", "avg_humidity", "max_wind_kph", "condition"}, ...].
    # Kept as JSON because "will it rain in the next 48h" is the single most
    # important input to the irrigation rules, and a row-per-day table would
    # be three joins for something nothing else ever queries.
    forecast = models.JSONField(default=list, blank=True)

    recorded_at = models.DateTimeField()

    def __str__(self):
        return f"{self.farm.name} Weather"

#Recommendation
class Recommendation(models.Model):

    PRIORITY = [
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
    ]

    farm = models.ForeignKey(
        Farm,
        on_delete=models.CASCADE,
        related_name="recommendations"
    )

    STATUS = [
        ("New", "New"),
        ("Accepted", "Accepted"),
        ("Dismissed", "Dismissed"),
        ("Done", "Done"),
    ]

    recommendation_type = models.CharField(max_length=100)

    # Short headline, e.g. "Irrigate within 24 hours".
    title = models.CharField(max_length=200, blank=True, default="")

    message = models.TextField()

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY
    )

    # The engine's raw 0-21 score behind that label. Same field as on Task and
    # for the same reason: the notification bell and the advisory list both
    # need to rank two "High" items against each other.
    priority_score = models.IntegerField(default=0)

    generated_by = models.CharField(max_length=100)

    status = models.CharField(max_length=20, choices=STATUS, default="New")

    # The readings that triggered this rule, so a farmer asking "why?" gets an
    # answer instead of a black box: {"rule": .., "reasons": [..],
    # "readings": {..}}. Also lets the same advice be re-explained later even
    # after the sensor values have moved on.
    details = models.JSONField(default=dict, blank=True)

    # Stops the same advice piling up every time the engine runs. One live
    # recommendation per rule per farm; a re-run updates it in place.
    rule_key = models.CharField(max_length=100, blank=True, default="", db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Most urgent first - the notification bell shows the top of this list.
        ordering = ["-priority_score", "-created_at"]

    def __str__(self):
        return self.title or self.recommendation_type

#Task
class Task(models.Model):

    PRIORITY = [
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
    ]

    STATUS = [
        ("Pending", "Pending"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
    ]

    # Matches the type filter the frontend task board already renders.
    TYPES = [
        ("Irrigation", "Irrigation"),
        ("Fertilizer", "Fertilizer"),
        ("Inspection", "Inspection"),
        ("Maintenance", "Maintenance"),
        ("Harvest", "Harvest"),
        ("Other", "Other"),
    ]

    SOURCES = [
        ("Manual", "Manual"),
        ("Advisory", "Advisory"),
    ]

    farm = models.ForeignKey(
        Farm,
        on_delete=models.CASCADE,
        related_name="tasks"
    )

    # Nullable: most advisory tasks ("spread urea", "harvest before the rain")
    # are jobs for the farmer, not the machine, and a farm may not have a
    # robot assigned yet.
    robot = models.ForeignKey(
        Robot,
        on_delete=models.SET_NULL,
        related_name="tasks",
        null=True,
        blank=True,
    )

    title = models.CharField(max_length=200)

    # Advisory tasks carry the engine's full explanation here. A task the
    # admin writes by hand often needs nothing beyond its title.
    description = models.TextField(blank=True, default="")

    task_type = models.CharField(max_length=20, choices=TYPES, default="Other")

    # Who is meant to do it. A name, matching how Farm.owner and Robot.farmer
    # already identify a customer. Advisory tasks start on the farm's owner;
    # the admin can hand one to somebody else.
    assigned_to = models.CharField(max_length=200, blank=True, default="")

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY
    )

    # The engine's raw score behind that label (0-21). Stored so the board can
    # rank two "High" tasks against each other, and so the order the admin
    # sees is the order the engine actually judged - not alphabetical luck.
    # Manual tasks keep 0 and fall in behind advisory ones of the same label.
    priority_score = models.IntegerField(default=0)

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="Pending"
    )

    due_date = models.DateField(null=True, blank=True)

    # Set on the assign form for the two task types where a quantity is the
    # whole instruction. Null everywhere else.
    # TODO: feed these to the robot's irrigation/dispenser control once the
    # hardware API exists.
    water_quantity = models.FloatField(null=True, blank=True)

    fertilizer_level = models.FloatField(null=True, blank=True)

    source = models.CharField(max_length=20, choices=SOURCES, default="Manual")

    # Set when the engine raised this task, so accepting the same advice twice
    # updates one task instead of spawning duplicates.
    recommendation = models.ForeignKey(
        Recommendation,
        on_delete=models.SET_NULL,
        related_name="tasks",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Most urgent first, then soonest due. The admin opening the board sees
        # what the engine judged worst at the top without having to sort.
        ordering = ["-priority_score", "due_date", "-created_at"]

    def __str__(self):
        return self.title

#Activity Log
class ActivityLog(models.Model):

    robot = models.ForeignKey(
        Robot,
        on_delete=models.CASCADE,
        related_name="activity_logs"
    )

    activity = models.TextField()

    activity_type = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.activity_type

#Robot Assignment History
class RobotHistory(models.Model):

    # Stored as a plain string (not a ForeignKey) so a "Deleted" entry
    # survives after the robot itself is removed.
    robot_id = models.CharField(max_length=20)

    action = models.CharField(max_length=50)

    farmer = models.CharField(max_length=200, blank=True, default="-")

    by = models.CharField(max_length=200, blank=True, default="")

    date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.robot_id} - {self.action}"


#Staff Profile
class StaffProfile(models.Model):
    """The bits of an admin's profile Django's User has no column for.

    Name and email live on the User itself (email doubles as the login), so
    this only carries what the Settings page asks for on top of that.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="staff_profile",
    )

    # Master admins are Django superusers; this tells the other two staff
    # roles apart. Both can use the dashboard - only a master admin can
    # manage employees.
    ROLES = [
        ("admin", "Admin"),
        ("employee", "Employee"),
    ]

    role = models.CharField(max_length=20, choices=ROLES, default="admin")

    phone = models.CharField(max_length=20, blank=True, default="")

    # Settings > Notifications. Saved per admin; nothing sends email from
    # these yet, but whatever does should check them first.
    notify_email = models.BooleanField(default=True)
    notify_task_assignments = models.BooleanField(default=True)
    notify_robot_alerts = models.BooleanField(default=True)

    def __str__(self):
        return f"profile:{self.user}"


#Password Reset Code
class PasswordResetCode(models.Model):
    """A one-time 6-digit code emailed for "Forgot password".

    Only the hash is stored, so a leaked database does not hand out working
    codes. Each code expires, allows a handful of guesses, and is spent the
    moment a new password is set with it.
    """

    LIFETIME_MINUTES = 10
    MAX_ATTEMPTS = 5

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="password_reset_codes",
    )

    code_hash = models.CharField(max_length=128)

    attempts = models.PositiveSmallIntegerField(default=0)

    expires_at = models.DateTimeField()

    used_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"reset:{self.user} @ {self.created_at:%Y-%m-%d %H:%M}"
