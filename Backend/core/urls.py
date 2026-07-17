from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    FarmerViewSet,
    FarmViewSet,
    SoilViewSet,
    CropViewSet,
    RobotViewSet,
    SensorDataViewSet,
    WeatherViewSet,
    RecommendationViewSet,
    TaskViewSet,
    ActivityLogViewSet,
)

router = DefaultRouter()
router.register(r"farmers", FarmerViewSet)
router.register(r"farms", FarmViewSet)
router.register(r"soils", SoilViewSet)
router.register(r"crops", CropViewSet)
router.register(r"robots", RobotViewSet)
router.register(r"sensor-data", SensorDataViewSet)
router.register(r"weather", WeatherViewSet)
router.register(r"recommendations", RecommendationViewSet)
router.register(r"tasks", TaskViewSet)
router.register(r"activity-logs", ActivityLogViewSet)

urlpatterns = [
    # JWT auth
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Resource endpoints
    path("", include(router.urls)),
]
