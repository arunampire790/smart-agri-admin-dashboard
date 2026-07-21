from rest_framework import serializers

from .models import (
    Farmer,
    Farm,
    Soil,
    Crop,
    Robot,
    SensorData,
    Weather,
    Recommendation,
    Task,
    ActivityLog,
    RobotHistory,
)


class FarmerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farmer
        fields = "__all__"


class FarmSerializer(serializers.ModelSerializer):
    # Expose the exact camelCase keys the frontend already uses, so the
    # React contexts need no field renaming.
    cropTypes = serializers.CharField(
        source="crop_types", required=False, allow_blank=True
    )
    assignedRobots = serializers.JSONField(source="assigned_robots", required=False)

    class Meta:
        model = Farm
        fields = [
            "id",
            "name",
            "owner",
            "crop",
            "cropTypes",
            "soil",
            "robot",
            "assignedRobots",
            "status",
            "size",
            "devices",
            "coordinates",
            "created_at",
        ]


class SoilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Soil
        fields = "__all__"


class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = "__all__"


class RobotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Robot
        # Exact shape the frontend already uses.
        fields = [
            "id",
            "name",
            "model",
            "status",
            "farmer",
            "farm",
            "battery",
            "registered",
            "notes",
            "created_at",
        ]


class RobotHistorySerializer(serializers.ModelSerializer):
    # camelCase key to match the frontend history objects.
    robotId = serializers.CharField(source="robot_id")

    class Meta:
        model = RobotHistory
        fields = ["id", "robotId", "action", "farmer", "by", "date"]


class SensorDataSerializer(serializers.ModelSerializer):
    robot_code = serializers.CharField(source="robot.id", read_only=True)

    class Meta:
        model = SensorData
        fields = "__all__"


class WeatherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Weather
        fields = "__all__"


class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(source="farm.name", read_only=True)
    robot_code = serializers.CharField(source="robot.id", read_only=True)

    class Meta:
        model = Task
        fields = "__all__"


class ActivityLogSerializer(serializers.ModelSerializer):
    robot_code = serializers.CharField(source="robot.id", read_only=True)

    class Meta:
        model = ActivityLog
        fields = "__all__"
