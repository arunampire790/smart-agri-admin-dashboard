from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils import timezone
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
    """Customer accounts, in the exact shape the React users table renders.

    Creating one also creates the Django login the customer signs in with -
    accounts only ever come from an admin doing this, never from a sign-up
    form, so the password is required up front and write-only afterwards.
    """

    name = serializers.CharField(source="full_name")
    phone = serializers.CharField(source="mobile")
    joined = serializers.DateTimeField(
        source="created_at", format="%Y-%m-%d", read_only=True
    )
    # Counted live from the farms table rather than stored on the row.
    farms = serializers.SerializerMethodField()
    hasLogin = serializers.SerializerMethodField()
    # The credential the admin hands to the customer. Never read back.
    # Same rules as admin passwords (8+ characters, not too common, not all
    # digits) - see AUTH_PASSWORD_VALIDATORS.
    password = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )

    class Meta:
        model = Farmer
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "address",
            "status",
            "farms",
            "joined",
            "hasLogin",
            "password",
        ]

    def get_farms(self, obj):
        return Farm.objects.filter(owner=obj.full_name).count()

    def get_hasLogin(self, obj):
        return obj.auth_user_id is not None

    def validate_password(self, value):
        if value:
            try:
                validate_password(value)
            except DjangoValidationError as exc:
                raise serializers.ValidationError(list(exc.messages))
        return value

    def validate(self, attrs):
        # On create there is no other way for the customer to get a password,
        # so refuse to make an account they could never sign in to.
        if self.instance is None and not attrs.get("password"):
            raise serializers.ValidationError(
                {"password": "A login password is required for a new account."}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password", "")
        with transaction.atomic():
            farmer = Farmer.objects.create(**validated_data)
            farmer.auth_user = self._create_login(farmer, password)
            farmer.save(update_fields=["auth_user"])
        return farmer

    def update(self, instance, validated_data):
        password = validated_data.pop("password", "")
        with transaction.atomic():
            farmer = super().update(instance, validated_data)
            login = farmer.auth_user
            if login is None:
                if password:
                    farmer.auth_user = self._create_login(farmer, password)
                    farmer.save(update_fields=["auth_user"])
            else:
                # Keep the login in step with the profile: the email is the
                # username, and suspending the customer must lock them out.
                login.username = farmer.email
                login.email = farmer.email
                login.first_name = farmer.full_name
                login.is_active = farmer.status == "Active"
                if password:
                    login.set_password(password)
                login.save()
        return farmer

    @staticmethod
    def _create_login(farmer, password):
        User = get_user_model()
        if User.objects.filter(username=farmer.email).exists():
            raise serializers.ValidationError(
                {"email": "A login already exists for this email address."}
            )
        return User.objects.create_user(
            username=farmer.email,
            email=farmer.email,
            first_name=farmer.full_name,
            password=password,
            is_active=farmer.status == "Active",
        )


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
    # What the QR encodes: the signed pairing payload, which the farmer holds
    # up to the robot's camera. Not a link - nothing here is opened in a
    # browser. Empty until the robot has an owner, and empty again once it is
    # paired, which is how the dashboard tells the two states apart.
    pairPayload = serializers.SerializerMethodField()
    isPaired = serializers.SerializerMethodField()

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
            "pairPayload",
            "isPaired",
            "created_at",
        ]

    def _farmer_ids(self):
        """{full_name: id} for every customer, fetched once per response.

        Robot.farmer is a name string rather than a foreign key, so turning it
        into the id the payload needs is a lookup per robot. The assignment
        page lists every robot at once, so doing that lazily would be a query
        each - one map covers the whole page instead.
        """
        if not hasattr(self, "_farmer_id_map"):
            self._farmer_id_map = dict(Farmer.objects.values_list("full_name", "id"))
        return self._farmer_id_map

    def get_pairPayload(self, obj):
        # Imported here rather than at module scope: services.device imports
        # models, and models is what imports this module's siblings.
        from .services.device import (
            PairPayloadError,
            build_pair_payload,
            encode_pair_payload,
        )

        farmer_id = self._farmer_ids().get((obj.farmer or "").strip())
        if not obj.pair_token or farmer_id is None:
            return ""

        # A payload needs a real customer behind it. A robot assigned to a
        # name with no matching record has nothing to pair *to*, so it gets
        # no code rather than a broken one.
        try:
            payload = build_pair_payload(obj, farmer_id)
        except PairPayloadError:
            return ""
        return encode_pair_payload(payload)

    def get_isPaired(self, obj):
        return obj.paired_at is not None

    def validate(self, attrs):
        if not ({"farmer", "farm"} & attrs.keys()):
            return attrs

        farmer = attrs.get(
            "farmer", self.instance.farmer if self.instance is not None else None
        )
        farm_name = attrs.get(
            "farm", self.instance.farm if self.instance is not None else ""
        )

        if (
            self.instance is not None
            and "farmer" in attrs
            and (farmer or "").strip() != (self.instance.farmer or "").strip()
            and "farm" not in attrs
        ):
            farm_name = ""
            attrs["farm"] = ""

        if farm_name:
            farms = Farm.objects.filter(name=farm_name).order_by("id")
            if not farms.exists():
                raise serializers.ValidationError(
                    {"farm": "Select an existing farm."}
                )
            if not farmer or not any(
                farm.owner.strip() == farmer.strip() for farm in farms
            ):
                raise serializers.ValidationError(
                    {"farm": "The selected farm must belong to the assigned farmer."}
                )
        return attrs

    def update(self, instance, validated_data):
        new_farmer = validated_data.get("farmer", instance.farmer)
        if (new_farmer or "").strip() != (instance.farmer or "").strip():
            instance.paired_at = None
            instance.pair_token = ""
            if instance.status == "Active":
                validated_data["status"] = "Assigned"
        return super().update(instance, validated_data)


class RobotHistorySerializer(serializers.ModelSerializer):
    # camelCase key to match the frontend history objects.
    robotId = serializers.CharField(source="robot_id")

    class Meta:
        model = RobotHistory
        fields = ["id", "robotId", "action", "farmer", "by", "date"]


class SensorDataSerializer(serializers.ModelSerializer):
    robot_code = serializers.CharField(source="robot.id", read_only=True)
    # A real robot stamps its own reading. A reading posted by hand - from the
    # simulator page, until the machine exists - means "as of now".
    recorded_at = serializers.DateTimeField(required=False, default=timezone.now)
    # Which farm the reading lands on, so the entry page can show that a
    # robot with no farm is a reading the advisory will never see.
    farm = serializers.CharField(source="robot.farm", read_only=True)
    # Charge rides along with the reading rather than being a separate call:
    # a robot radioing in sends one packet of "here is how I am and what I
    # see". It lives on Robot, not on the reading - the dashboard wants the
    # current charge, not a history of it.
    battery = serializers.IntegerField(
        required=False, write_only=True, min_value=0, max_value=100
    )

    class Meta:
        model = SensorData
        fields = "__all__"

    def create(self, validated_data):
        battery = validated_data.pop("battery", None)
        reading = super().create(validated_data)
        if battery is not None:
            reading.robot.battery = battery
            reading.robot.save(update_fields=["battery"])
        return reading


class WeatherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Weather
        fields = "__all__"


class RecommendationSerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(source="farm.name", read_only=True)

    class Meta:
        model = Recommendation
        fields = "__all__"
        # The engine owns these - a client can only move the status.
        read_only_fields = ["generated_by", "rule_key", "details"]


class FarmByNameField(serializers.SlugRelatedField):
    """A farm addressed by name, the way the rest of this app refers to them.

    `Farm.name` is not unique in the schema, so a plain SlugRelatedField would
    raise MultipleObjectsReturned - a 500 - the first time an admin creates two
    farms with the same name. Resolve it here instead: pick the oldest match,
    deterministically, and let an unknown name be an ordinary 400.
    """

    def to_internal_value(self, data):
        farm = self.get_queryset().filter(**{self.slug_field: data}).order_by("id").first()
        if farm is None:
            self.fail("does_not_exist", slug_name=self.slug_field, value=data)
        return farm


class TaskSerializer(serializers.ModelSerializer):
    """The task board's shape, in the camelCase the React pages already use.

    Farms are addressed by name rather than id: that is what the board shows,
    what the assign form collects, and what Robot.farmer / Farm.owner already
    key on elsewhere in this app.
    """

    farm = FarmByNameField(slug_field="name", queryset=Farm.objects.all())
    robot_code = serializers.CharField(source="robot.id", read_only=True)
    assignedTo = serializers.CharField(
        source="assigned_to", required=False, allow_blank=True
    )
    type = serializers.CharField(source="task_type", required=False)
    dueDate = serializers.DateField(source="due_date", required=False, allow_null=True)
    waterQuantity = serializers.FloatField(
        source="water_quantity", required=False, allow_null=True
    )
    fertilizerLevel = serializers.FloatField(
        source="fertilizer_level", required=False, allow_null=True
    )
    # Read-only: the engine owns the score, and a client raising a task by
    # hand does not get to jump the queue by claiming one.
    priorityScore = serializers.IntegerField(source="priority_score", read_only=True)
    # The advice this came from, so the board can show why it exists.
    recommendationDetails = serializers.JSONField(
        source="recommendation.details", read_only=True
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "farm",
            "robot",
            "robot_code",
            "title",
            "description",
            "type",
            "assignedTo",
            "priority",
            "priorityScore",
            "status",
            "dueDate",
            "waterQuantity",
            "fertilizerLevel",
            "source",
            "recommendation",
            "recommendationDetails",
            "created_at",
        ]
        read_only_fields = ["source", "recommendation"]


class ActivityLogSerializer(serializers.ModelSerializer):
    robot_code = serializers.CharField(source="robot.id", read_only=True)

    class Meta:
        model = ActivityLog
        fields = "__all__"
