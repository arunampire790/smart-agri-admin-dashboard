from django.db import models

# Create your models here.

#Farmer
class Farmer(models.Model):

    full_name = models.CharField(max_length=100)

    email = models.EmailField(unique=True)

    mobile = models.CharField(max_length=15)

    address = models.TextField()

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

    created_at = models.DateTimeField(auto_now_add=True)

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

    recorded_at = models.DateTimeField()

    def __str__(self):
        return f"{self.farm.farm_name} Weather"

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

    recommendation_type = models.CharField(max_length=100)

    message = models.TextField()

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY
    )

    generated_by = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.recommendation_type

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

    farm = models.ForeignKey(
        Farm,
        on_delete=models.CASCADE,
        related_name="tasks"
    )

    robot = models.ForeignKey(
        Robot,
        on_delete=models.CASCADE,
        related_name="tasks"
    )

    title = models.CharField(max_length=200)

    description = models.TextField()

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="Pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)

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
