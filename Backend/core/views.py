from rest_framework import viewsets

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
from .serializers import (
    FarmerSerializer,
    FarmSerializer,
    SoilSerializer,
    CropSerializer,
    RobotSerializer,
    SensorDataSerializer,
    WeatherSerializer,
    RecommendationSerializer,
    TaskSerializer,
    ActivityLogSerializer,
)


class FarmerViewSet(viewsets.ModelViewSet):
    queryset = Farmer.objects.all().order_by("-created_at")
    serializer_class = FarmerSerializer


class FarmViewSet(viewsets.ModelViewSet):
    queryset = Farm.objects.select_related("farmer").all().order_by("-created_at")
    serializer_class = FarmSerializer


class SoilViewSet(viewsets.ModelViewSet):
    queryset = Soil.objects.select_related("farm").all()
    serializer_class = SoilSerializer


class CropViewSet(viewsets.ModelViewSet):
    queryset = Crop.objects.select_related("farm").all()
    serializer_class = CropSerializer


class RobotViewSet(viewsets.ModelViewSet):
    queryset = Robot.objects.select_related("farm").all().order_by("-created_at")
    serializer_class = RobotSerializer


class SensorDataViewSet(viewsets.ModelViewSet):
    queryset = SensorData.objects.select_related("robot").all().order_by("-recorded_at")
    serializer_class = SensorDataSerializer


class WeatherViewSet(viewsets.ModelViewSet):
    queryset = Weather.objects.select_related("farm").all().order_by("-recorded_at")
    serializer_class = WeatherSerializer


class RecommendationViewSet(viewsets.ModelViewSet):
    queryset = Recommendation.objects.select_related("farm").all().order_by("-created_at")
    serializer_class = RecommendationSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.select_related("farm", "robot").all().order_by("-created_at")
    serializer_class = TaskSerializer


class ActivityLogViewSet(viewsets.ModelViewSet):
    queryset = ActivityLog.objects.select_related("robot").all().order_by("-created_at")
    serializer_class = ActivityLogSerializer
