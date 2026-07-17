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
)


class FarmerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farmer
        fields = "__all__"


class FarmSerializer(serializers.ModelSerializer):
    # Read-only convenience field so the frontend can show the owner name
    # without a second request.
    farmer_name = serializers.CharField(source="farmer.full_name", read_only=True)

    class Meta:
        model = Farm
        fields = "__all__"


class SoilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Soil
        fields = "__all__"


class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = "__all__"


class RobotSerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(source="farm.farm_name", read_only=True)

    class Meta:
        model = Robot
        fields = "__all__"


class SensorDataSerializer(serializers.ModelSerializer):
    robot_code = serializers.CharField(source="robot.robot_code", read_only=True)

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
    farm_name = serializers.CharField(source="farm.farm_name", read_only=True)
    robot_code = serializers.CharField(source="robot.robot_code", read_only=True)

    class Meta:
        model = Task
        fields = "__all__"


class ActivityLogSerializer(serializers.ModelSerializer):
    robot_code = serializers.CharField(source="robot.robot_code", read_only=True)

    class Meta:
        model = ActivityLog
        fields = "__all__"
