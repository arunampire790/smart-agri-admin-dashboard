from django.utils import timezone
from django.db import transaction
from rest_framework import exceptions, status, viewsets
from rest_framework.decorators import (
    action,
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .authentication import DeviceAuthentication, device_from_request
from .permissions import IsAdmin, IsDevice
from .services.advisory import run_advisory, save_advisory
from .services.device import (
    PairPayloadError,
    build_pair_payload,
    decode_pair_payload,
    encode_pair_payload,
    verify_pair_payload,
)
from .services.weather import WeatherUnavailable, refresh_farm_weather
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
    RobotHistorySerializer,
)


class AdminModelViewSet(viewsets.ModelViewSet):
    """Base for every dashboard resource.

    Staff-only across the board. Individual @action methods that customers
    need (QR pairing) set their own permission_classes and override this.
    """

    permission_classes = [IsAdmin]


class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login for the admin dashboard.

    Customer accounts are ordinary (non-staff) Django users, so they get a
    valid password but are turned away from the admin panel here.
    """

    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_staff:
            # 401, same as a wrong password, so the login form's existing
            # "invalid credentials" message applies.
            raise exceptions.AuthenticationFailed(
                "This account cannot sign in to the admin panel."
            )
        return data


class AdminTokenObtainPairView(TokenObtainPairView):
    serializer_class = AdminTokenObtainPairSerializer


class FarmerViewSet(AdminModelViewSet):
    queryset = Farmer.objects.select_related("auth_user").all().order_by("-created_at")
    serializer_class = FarmerSerializer

    def perform_destroy(self, instance):
        # Deleting the customer must take their login with it, otherwise the
        # credentials would keep working with no profile behind them.
        login = instance.auth_user
        instance.delete()
        if login is not None:
            login.delete()


class FarmViewSet(AdminModelViewSet):
    queryset = Farm.objects.all().order_by("-created_at")
    serializer_class = FarmSerializer

    @action(detail=True, methods=["get"], url_path="advisory")
    def advisory(self, request, pk=None):
        """What this farm should do today, worked out fresh on every call.

        Read-only preview: nothing is written, so the dashboard can poll it
        without filling the farmer's task list. `?weather=0` skips the
        WeatherAPI call and reasons over the last stored forecast instead.
        """
        farm = self.get_object()
        refresh = request.query_params.get("weather", "1") != "0"
        return Response(run_advisory(farm, refresh_weather=refresh))

    @advisory.mapping.post
    def generate_advisory(self, request, pk=None):
        """Run the engine and commit the result.

        Recommendations are upserted per rule and tasks are raised from the
        actionable ones, so calling this twice in a row changes nothing the
        second time. Pass {"tasks": false} to save advice without tasks.
        """
        farm = self.get_object()
        refresh = request.data.get("weather", True) is not False
        create_tasks = request.data.get("tasks", True) is not False

        result = run_advisory(farm, refresh_weather=refresh)
        saved = save_advisory(farm, result, create_tasks=create_tasks)
        return Response({**result, "saved": saved})

    @action(detail=True, methods=["post"], url_path="refresh-weather")
    def refresh_weather(self, request, pk=None):
        """Pull the current conditions and forecast from WeatherAPI."""
        farm = self.get_object()
        try:
            weather = refresh_farm_weather(farm, force=True)
        except WeatherUnavailable as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        return Response(WeatherSerializer(weather).data)


class SoilViewSet(AdminModelViewSet):
    queryset = Soil.objects.select_related("farm").all()
    serializer_class = SoilSerializer


class CropViewSet(AdminModelViewSet):
    queryset = Crop.objects.select_related("farm").all()
    serializer_class = CropSerializer


class RobotViewSet(AdminModelViewSet):
    queryset = Robot.objects.all().order_by("id")
    serializer_class = RobotSerializer

    def perform_create(self, serializer):
        with transaction.atomic():
            robot = serializer.save()
            _sync_robot_farm(robot.id, robot.farm, robot.farmer)

    def perform_update(self, serializer):
        with transaction.atomic():
            robot = serializer.save()
            _sync_robot_farm(robot.id, robot.farm, robot.farmer)

    def perform_destroy(self, instance):
        with transaction.atomic():
            _sync_robot_farm(instance.id)
            instance.delete()

    @action(detail=True, methods=["get"], url_path="pair-code")
    def pair_code(self, request, pk=None):
        """The QR the farmer is handed, and the config the robot is flashed with.

        Both halves come from one call because they must be byte-identical -
        generating them separately is how you end up with a robot that will
        never recognise its owner. `qr_payload` is what the dashboard renders
        as a QR code; `provisioning` is what goes to whoever images the robot.

        Admin-only, and `device_key` is in the response, so this is not a
        screen to leave open on a shared machine.
        """
        robot = self.get_object()

        if not (robot.farmer or "").strip():
            return Response(
                {"detail": "Assign this robot to a customer before issuing a code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        farmer = Farmer.objects.filter(full_name=robot.farmer).first()
        if farmer is None:
            return Response(
                {"detail": f"No customer record found for '{robot.farmer}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payload = build_pair_payload(robot, farmer.id)
        except PairPayloadError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)

        encoded = encode_pair_payload(payload)
        return Response(
            {
                "robot_id": robot.id,
                "farmer": farmer.full_name,
                # Print this as a QR code and give it to the farmer.
                "qr_payload": encoded,
                # Flash this into the robot. `expected_payload` is compared
                # character for character against whatever the camera reads.
                "provisioning": {
                    "robot_id": robot.id,
                    "device_key": robot.device_key,
                    "expected_payload": encoded,
                },
            }
        )


def _sync_robot_farm(robot_id, farm_name="", farmer_name=""):
    target = None
    if farm_name and farmer_name:
        target = next(
            (
                farm
                for farm in Farm.objects.filter(name=farm_name).order_by("id")
                if farm.owner.strip() == farmer_name.strip()
            ),
            None,
        )

    for farm in Farm.objects.all():
        assigned = list(farm.assigned_robots or [])
        if target is not None and farm.pk == target.pk:
            if robot_id not in assigned:
                assigned.append(robot_id)
        elif robot_id in assigned:
            assigned = [assigned_id for assigned_id in assigned if assigned_id != robot_id]

        robot_list = ", ".join(assigned)
        if (
            assigned != list(farm.assigned_robots or [])
            or farm.robot != robot_list
        ):
            farm.assigned_robots = assigned
            farm.robot = robot_list
            farm.save(update_fields=["assigned_robots", "robot"])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    """The signed-in customer's own profile and farms.

    Used by the QR pairing page, which must not see anyone else's data.
    """
    profile = getattr(request.user, "farmer_profile", None)
    if profile is None:
        raise exceptions.PermissionDenied("This is not a customer account.")

    return Response(
        {
            "name": profile.full_name,
            "email": profile.email,
            "farms": list(
                Farm.objects.filter(owner=profile.full_name).values_list(
                    "name", flat=True
                )
            ),
        }
    )


# --- Robot-facing API ----------------------------------------------------
#
# Everything above this line is for a browser with a signed-in human behind
# it. Everything below is for the machine in the field, which authenticates
# with `Authorization: Device <key>` and never sees a login form.
#
# The rule these three share: the device key decides which robot this is, and
# anything the request *says* about its identity is only ever checked against
# that, never trusted in its place.


@api_view(["POST"])
@authentication_classes([DeviceAuthentication])
@permission_classes([IsDevice])
def device_pair(request):
    """The robot has read a farmer's QR and wants the pairing confirmed.

    By the time this is called the robot has already compared the scanned
    string against the one flashed into it, offline. That check is the fast
    path in the field; this one is the authoritative one, because firmware
    can be modified and a camera can be shown anything.

    Three things have to line up: the payload must carry our signature, it
    must name *this* robot rather than some other one, and the token in it
    must still be the live one in the database.
    """
    robot = device_from_request(request)

    raw = request.data.get("payload")
    if raw in (None, ""):
        return Response(
            {"detail": "No scanned payload was sent."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        payload = decode_pair_payload(raw)
        payload_robot_id, farmer_id = verify_pair_payload(payload)
    except PairPayloadError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    # A genuine QR, but for a different robot - the farmer is holding someone
    # else's code, or two robots were provisioned from the same batch.
    if payload_robot_id != robot.id:
        return Response(
            {
                "detail": "This code belongs to a different robot.",
                "expected": robot.id,
                "scanned": payload_robot_id,
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if robot.paired_at is not None:
        return Response(
            {"detail": "This robot is already paired."},
            status=status.HTTP_409_CONFLICT,
        )

    # Signature checks that we issued the payload; this checks it is still the
    # current one. An old QR photographed before the robot was reassigned is
    # correctly signed and still has to be refused.
    if not robot.pair_token or payload.get("tok") != robot.pair_token:
        return Response(
            {"detail": "This code has expired. Ask for a new one."},
            status=status.HTTP_403_FORBIDDEN,
        )

    farmer = Farmer.objects.filter(id=farmer_id).first()
    if farmer is None:
        return Response(
            {"detail": "The customer on this code no longer exists."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # The admin's assignment is the source of truth for who owns what. If the
    # robot was reassigned after the code went out, the code loses.
    if (robot.farmer or "").strip() != farmer.full_name:
        return Response(
            {"detail": "This robot is assigned to a different customer."},
            status=status.HTTP_403_FORBIDDEN,
        )

    own_farms = list(Farm.objects.filter(owner=farmer.full_name))
    if not robot.farm and len(own_farms) == 1:
        robot.farm = own_farms[0].name

    robot.status = "Active"
    robot.paired_at = timezone.now()
    robot.pair_token = ""  # single use - a photographed QR cannot be replayed
    robot.last_seen_at = timezone.now()
    robot.save()

    # The link is stored on both sides - Robot.farm, and the farm's own
    # assigned_robots list that the dashboard tables read. Writing only the
    # robot's half is what the advisory engine's "read both, they drift"
    # comment is working around, so close the gap here rather than widen it.
    _sync_robot_farm(robot.id, robot.farm, farmer.full_name)

    RobotHistory.objects.create(
        robot_id=robot.id,
        action="Paired via QR scan",
        farmer=farmer.full_name,
        by=farmer.full_name,
        date=timezone.localdate(),
    )

    return Response(
        {
            "paired": True,
            "robot_id": robot.id,
            "farmer": farmer.full_name,
            "farm": robot.farm,
            "paired_at": robot.paired_at,
        }
    )


@api_view(["GET"])
@authentication_classes([DeviceAuthentication])
@permission_classes([IsDevice])
def device_me(request):
    """Who am I, and am I paired?

    What a robot calls on boot to find out whether it still needs to scan a
    QR - cheaper and more reliable than storing that answer in its own flash,
    which goes stale the moment an admin reassigns the machine.
    """
    robot = device_from_request(request)
    return Response(
        {
            "robot_id": robot.id,
            "name": robot.name,
            "model": robot.model,
            "paired": robot.paired_at is not None,
            "farmer": robot.farmer or "",
            "farm": robot.farm or "",
            "status": robot.status,
            "server_time": timezone.now(),
        }
    )


@api_view(["POST"])
@authentication_classes([DeviceAuthentication])
@permission_classes([IsDevice])
def device_telemetry(request):
    """A sensor reading from the field.

    `robot_id` is required even though the device key already identifies the
    machine, and it is rejected on mismatch. That redundancy is the point: it
    catches a robot flashed with the wrong config, or two machines imaged from
    the same card, at the first reading rather than after a season of data has
    landed under the wrong farm.

    Readings from an unpaired robot are refused rather than stored, because a
    reading with no farm behind it is invisible to the advisory engine - it
    would look like the robot was working when nothing was reaching anyone.
    """
    robot = device_from_request(request)

    data = request.data
    if not isinstance(data, dict):
        return Response(
            {"detail": "Send one reading as a JSON object."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    data = data.copy()

    claimed = data.pop("robot_id", None) or data.get("robot")
    if claimed in (None, ""):
        return Response(
            {"detail": "robot_id is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if str(claimed) != robot.id:
        return Response(
            {
                "detail": "This reading is labelled for a different robot.",
                "expected": robot.id,
                "received": str(claimed),
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if robot.paired_at is None:
        return Response(
            {"detail": "This robot is not paired yet. Scan the customer's QR code."},
            status=status.HTTP_409_CONFLICT,
        )

    # The serializer takes the robot as `robot`; the wire format calls it
    # `robot_id`, which is the name firmware people expect.
    data["robot"] = robot.id

    serializer = SensorDataSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    reading = serializer.save()

    return Response(
        {"stored": True, "id": reading.id, "recorded_at": reading.recorded_at},
        status=status.HTTP_201_CREATED,
    )


class RobotHistoryViewSet(AdminModelViewSet):
    queryset = RobotHistory.objects.all().order_by("-date", "-created_at")
    serializer_class = RobotHistorySerializer


class SensorDataViewSet(AdminModelViewSet):
    queryset = SensorData.objects.select_related("robot").all().order_by("-recorded_at")
    serializer_class = SensorDataSerializer

    def get_queryset(self):
        """?robot=ROB-0001 and ?limit=10, for the data-entry page's history.

        Readings pile up fast - one robot on a 3-hour cycle is 57 rows a week -
        so an unfiltered list is not something a page should ever ask for.
        """
        queryset = super().get_queryset()
        robot_id = self.request.query_params.get("robot")
        if robot_id:
            queryset = queryset.filter(robot_id=robot_id)
        limit = self.request.query_params.get("limit")
        if limit and limit.isdigit():
            queryset = queryset[: int(limit)]
        return queryset

    @action(detail=False, methods=["delete"], url_path="clear")
    def clear(self, request):
        """Wipe one robot's readings.

        The advisory averages the last 24 hours so a single odd sample cannot
        swing the advice - right for a field, wrong for a bench test, where
        every reading you send gets blended with the ones before it and the
        advice stops tracking what you typed.

        `?robot=` is required: without it this would be a one-request way to
        destroy every reading in the database.
        """
        robot_id = request.query_params.get("robot")
        if not robot_id:
            return Response(
                {"detail": "Pass ?robot=<id> - this endpoint will not clear every robot."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        deleted, _ = SensorData.objects.filter(robot_id=robot_id).delete()
        return Response({"deleted": deleted, "robot": robot_id})


class WeatherViewSet(AdminModelViewSet):
    queryset = Weather.objects.select_related("farm").all().order_by("-recorded_at")
    serializer_class = WeatherSerializer


class RecommendationViewSet(AdminModelViewSet):
    # No .order_by(): Recommendation.Meta already ranks by the engine's score,
    # which is the order the notification bell needs.
    queryset = Recommendation.objects.select_related("farm").all()
    serializer_class = RecommendationSerializer

    def get_queryset(self):
        """?farm=<id>, ?status=New, ?exclude_status=Dismissed, ?limit=10.

        The notification bell wants "everything still standing, most urgent
        first, capped" - hence exclude_status rather than another status= call.
        """
        queryset = super().get_queryset()
        farm_id = self.request.query_params.get("farm")
        if farm_id:
            queryset = queryset.filter(farm_id=farm_id)
        state = self.request.query_params.get("status")
        if state:
            queryset = queryset.filter(status=state)
        excluded = self.request.query_params.get("exclude_status")
        if excluded:
            queryset = queryset.exclude(status__in=excluded.split(","))
        limit = self.request.query_params.get("limit")
        if limit and limit.isdigit():
            queryset = queryset[: int(limit)]
        return queryset

    @action(detail=True, methods=["post"])
    def dismiss(self, request, pk=None):
        """Farmer has decided not to act on this.

        It stays dismissed on the next engine run unless the situation
        escalates to High priority.
        """
        recommendation = self.get_object()
        recommendation.status = "Dismissed"
        recommendation.save(update_fields=["status"])
        Task.objects.filter(
            recommendation=recommendation, source="Advisory", status="Pending"
        ).delete()
        return Response(self.get_serializer(recommendation).data)

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        """Acknowledge the advice and make sure a task exists for it."""
        recommendation = self.get_object()
        recommendation.status = "Accepted"
        recommendation.save(update_fields=["status"])

        if not recommendation.tasks.exists():
            Task.objects.create(
                farm=recommendation.farm,
                robot=Robot.objects.filter(farm=recommendation.farm.name).first(),
                recommendation=recommendation,
                title=recommendation.title or recommendation.recommendation_type,
                description=recommendation.message,
                task_type=recommendation.recommendation_type,
                assigned_to=recommendation.farm.owner,
                priority=recommendation.priority,
                priority_score=recommendation.details.get("priorityBasis", {}).get("score", 0),
                due_date=timezone.localdate(),
                source="Advisory",
            )
        return Response(self.get_serializer(recommendation).data)


class TaskViewSet(AdminModelViewSet):
    # No .order_by() here: Task.Meta already ranks by the engine's priority
    # score, so the board opens on the most urgent work.
    queryset = Task.objects.select_related("farm", "robot", "recommendation").all()
    serializer_class = TaskSerializer


class ActivityLogViewSet(AdminModelViewSet):
    queryset = ActivityLog.objects.select_related("robot").all().order_by("-created_at")
    serializer_class = ActivityLogSerializer
