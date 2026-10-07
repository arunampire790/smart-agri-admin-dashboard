from django.conf import settings
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .account_views import (
    account,
    change_password,
    password_reset_confirm,
    password_reset_request,
    password_reset_verify,
)
from .employee_views import EmployeeViewSet
from .views import (
    AdminTokenObtainPairView,
    device_me,
    device_pair,
    device_telemetry,
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
    RobotHistoryViewSet,
    me,
)

router = DefaultRouter()
router.register(r"farmers", FarmerViewSet)
router.register(r"farms", FarmViewSet)
router.register(r"soils", SoilViewSet)
router.register(r"crops", CropViewSet)
router.register(r"robots", RobotViewSet)
router.register(r"robot-history", RobotHistoryViewSet)
router.register(r"sensor-data", SensorDataViewSet)
router.register(r"weather", WeatherViewSet)
router.register(r"recommendations", RecommendationViewSet)
router.register(r"tasks", TaskViewSet)
router.register(r"activity-logs", ActivityLogViewSet)
router.register(r"employees", EmployeeViewSet, basename="employee")

urlpatterns = [
    # JWT auth. Two doors: the dashboard one only opens for staff, the
    # customer one for the logins the admin issues with each robot.
    path("auth/login/", AdminTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path(
        "auth/customer/login/",
        TokenObtainPairView.as_view(),
        name="customer_token_obtain_pair",
    ),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # The signed-in admin's own profile and password.
    path("auth/account/", account, name="account"),
    path("auth/account/password/", change_password, name="account_password"),
    # "Forgot password?" on the admin login page.
    path("auth/password-reset/request/", password_reset_request, name="password_reset_request"),
    path("auth/password-reset/verify/", password_reset_verify, name="password_reset_verify"),
    path("auth/password-reset/confirm/", password_reset_confirm, name="password_reset_confirm"),
    # The signed-in customer's own profile + farms (QR pairing page).
    path("me/", me, name="me"),
    # Robot-facing API. No login: these authenticate with the machine's own
    # device key, and are grouped under /device/ so the boundary between
    # "a human sent this" and "a robot sent this" is visible in the URL.
    path("device/me/", device_me, name="device_me"),
    path("device/pair/", device_pair, name="device_pair"),
    path("device/telemetry/", device_telemetry, name="device_telemetry"),
    # Resource endpoints
    path("", include(router.urls)),
]

if settings.DEBUG:
    from .dev_views import pair_demo

    # Browser stand-in for a robot's camera, so pairing can be demoed on a
    # phone before real hardware exists. See core/dev_views.py.
    urlpatterns += [
        path("dev/pair-demo/<str:robot_id>/", pair_demo, name="dev_pair_demo"),
    ]
