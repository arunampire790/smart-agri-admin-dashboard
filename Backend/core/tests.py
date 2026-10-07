"""Tests for the robot-facing API.

Covers the handshake the robot performs in the field: the admin issues one
signed payload, the farmer carries it as a QR, the robot scans it and calls
home, and from then on its readings are accepted only under its own identity.

The negative cases matter more than the happy path here - a robot that pairs
with the wrong farmer, or files a season of readings under someone else's
farm, fails silently and is found out much too late.
"""

import json

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Farm, Farmer, Robot, SensorData

User = get_user_model()

# A full reading. Every sensor field on the model is required, so this doubles
# as the documented payload shape for whoever writes the firmware.
READING = {
    "temperature": 28.4,
    "humidity": 62.0,
    "soil_moisture": 24.1,
    "soil_temperature": 26.0,
    "nitrogen": 34.0,
    "phosphorus": 18.0,
    "potassium": 41.0,
    "light_intensity": 850.0,
    "wind_speed": 7.2,
    "rainfall": 0.0,
}


class DeviceAPITests(TestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username="tester", password="x", is_staff=True
        )
        self.admin = APIClient()
        self.admin.force_authenticate(user=self.admin_user)

        self.farmer = Farmer.objects.create(
            full_name="Ramesh Patil", email="ramesh@example.com", mobile="9999900001"
        )
        Farm.objects.create(name="North Field", owner=self.farmer.full_name)

        # Two robots, same farmer: the interesting mix-ups are between
        # machines that legitimately belong to the same person.
        self.robot = Robot.objects.create(
            id="ROB-9001", name="Bot One", farmer=self.farmer.full_name
        )
        self.other = Robot.objects.create(
            id="ROB-9002", name="Bot Two", farmer=self.farmer.full_name
        )

        self.dev = APIClient(HTTP_AUTHORIZATION=f"Device {self.robot.device_key}")

    def qr_for(self, robot):
        res = self.admin.get(f"/api/robots/{robot.id}/pair-code/")
        self.assertEqual(res.status_code, 200, res.content)
        return res.json()["qr_payload"]

    def pair(self, robot=None):
        robot = robot or self.robot
        return self.dev.post(
            "/api/device/pair/", {"payload": self.qr_for(robot)}, format="json"
        )

    def telemetry(self, client=None, **overrides):
        body = dict(READING)
        body.setdefault("robot_id", self.robot.id)
        body.update(overrides)
        return (client or self.dev).post(
            "/api/device/telemetry/", body, format="json"
        )

    # --- provisioning ----------------------------------------------------
    def test_every_robot_gets_its_own_device_key(self):
        self.assertTrue(self.robot.device_key)
        self.assertNotEqual(self.robot.device_key, self.other.device_key)

    def test_pair_code_matches_what_the_robot_is_flashed_with(self):
        body = self.admin.get(f"/api/robots/{self.robot.id}/pair-code/").json()
        # If these two ever drift apart, the robot's offline comparison fails
        # and no robot in the field can ever be paired.
        self.assertEqual(body["provisioning"]["expected_payload"], body["qr_payload"])
        self.assertEqual(body["provisioning"]["device_key"], self.robot.device_key)
        self.assertIn("sig", json.loads(body["qr_payload"]))

    def test_pair_code_needs_an_assigned_customer(self):
        spare = Robot.objects.create(id="ROB-9003")
        self.assertEqual(
            self.admin.get(f"/api/robots/{spare.id}/pair-code/").status_code, 400
        )

    def test_pair_code_is_admin_only(self):
        # It carries the device key, so an anonymous read would hand out the
        # robot's identity to anyone who knows its id.
        self.assertIn(
            APIClient().get(f"/api/robots/{self.robot.id}/pair-code/").status_code,
            (401, 403),
        )

    def test_robot_list_carries_a_usable_pair_payload(self):
        # The assignment page renders the QR straight from the list response,
        # so the payload has to survive that trip - not just the detail call.
        rows = {r["id"]: r for r in self.admin.get("/api/robots/").json()}
        payload = rows[self.robot.id]["pairPayload"]
        self.assertEqual(payload, self.qr_for(self.robot))
        self.assertFalse(rows[self.robot.id]["isPaired"])

    def test_pair_payload_is_empty_without_an_owner(self):
        # No customer means nothing to pair to. An empty payload is what makes
        # the page fall back to a plain identity code.
        Robot.objects.create(id="ROB-9003")
        rows = {r["id"]: r for r in self.admin.get("/api/robots/").json()}
        self.assertEqual(rows["ROB-9003"]["pairPayload"], "")

    def test_pair_payload_disappears_once_paired(self):
        self.pair()
        rows = {r["id"]: r for r in self.admin.get("/api/robots/").json()}
        self.assertEqual(rows[self.robot.id]["pairPayload"], "")
        self.assertTrue(rows[self.robot.id]["isPaired"])

    def test_listing_robots_does_not_query_per_row(self):
        # The farmer-name-to-id map is built once per response. Without that
        # this is a query per robot, and the assignment page lists them all.
        for n in range(10, 20):
            Robot.objects.create(id=f"ROB-90{n}", farmer=self.farmer.full_name)
        with self.assertNumQueries(2):  # robots + the one farmer lookup
            self.admin.get("/api/robots/")

    # --- device authentication -------------------------------------------
    def test_bad_keys_are_refused(self):
        for header in ("Device wrong-key", "Device ", "Device"):
            self.assertEqual(
                APIClient(HTTP_AUTHORIZATION=header).get("/api/device/me/").status_code,
                401,
                header,
            )

    def test_no_key_is_refused(self):
        self.assertIn(APIClient().get("/api/device/me/").status_code, (401, 403))

    def test_valid_key_identifies_the_robot(self):
        body = self.dev.get("/api/device/me/").json()
        self.assertEqual(body["robot_id"], self.robot.id)
        self.assertFalse(body["paired"])

    def test_any_call_updates_last_seen(self):
        self.dev.get("/api/device/me/")
        self.robot.refresh_from_db()
        self.assertIsNotNone(self.robot.last_seen_at)

    def test_a_device_key_cannot_read_the_dashboard(self):
        # 401 rather than 403: dashboard endpoints do not list
        # DeviceAuthentication, so they never parse the Device scheme at all
        # and simply see an unauthenticated request. Refused either way, which
        # is the property worth pinning down.
        self.assertIn(self.dev.get("/api/robots/").status_code, (401, 403))

    # --- pairing ---------------------------------------------------------
    def test_scanning_the_right_qr_pairs_the_robot(self):
        res = self.pair()
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual(res.json()["farmer"], self.farmer.full_name)
        # One farm and no ambiguity, so the robot lands on it without asking.
        self.assertEqual(res.json()["farm"], "North Field")

        self.robot.refresh_from_db()
        self.assertIsNotNone(self.robot.paired_at)
        self.assertEqual(self.robot.status, "Active")
        self.assertEqual(self.robot.pair_token, "")

    def test_pairing_links_the_farm_from_both_sides(self):
        # The dashboard reads the farm's own list; the advisory engine reads
        # the robot's field. Both have to be written or one of them shows a
        # farm with no robot on it.
        self.pair()
        farm = Farm.objects.get(name="North Field")
        self.assertEqual(farm.assigned_robots, [self.robot.id])
        self.assertEqual(farm.robot, self.robot.id)

        self.robot.refresh_from_db()
        self.assertEqual(self.robot.farm, "North Field")

    def test_admin_can_assign_a_robot_to_a_specific_farm(self):
        Farm.objects.create(name="South Field", owner=self.farmer.full_name)

        res = self.admin.patch(
            f"/api/robots/{self.robot.id}/",
            {"farm": "South Field"},
            format="json",
        )

        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual(res.data["farm"], "South Field")
        self.assertEqual(Farm.objects.get(name="South Field").assigned_robots, [self.robot.id])

    def test_robot_cannot_be_assigned_to_another_farmers_farm(self):
        other_farmer = Farmer.objects.create(
            full_name="Sunita Jadhav", email="sunita@example.com", mobile="9999900002"
        )
        Farm.objects.create(name="South Field", owner=other_farmer.full_name)

        res = self.admin.patch(
            f"/api/robots/{self.robot.id}/",
            {"farm": "South Field"},
            format="json",
        )

        self.assertEqual(res.status_code, 400)
        self.assertIn("farm", res.data)

    def test_reassigning_a_paired_robot_moves_its_farm_and_requires_pairing_again(self):
        self.pair()
        next_farmer = Farmer.objects.create(
            full_name="Sunita Jadhav", email="sunita@example.com", mobile="9999900002"
        )
        Farm.objects.create(name="South Field", owner=next_farmer.full_name)

        res = self.admin.patch(
            f"/api/robots/{self.robot.id}/",
            {"farmer": next_farmer.full_name, "farm": "South Field"},
            format="json",
        )

        self.assertEqual(res.status_code, 200, res.content)
        self.assertFalse(res.data["isPaired"])
        self.assertTrue(res.data["pairPayload"])
        self.assertEqual(Farm.objects.get(name="North Field").assigned_robots, [])
        self.assertEqual(Farm.objects.get(name="South Field").assigned_robots, [self.robot.id])

        paired = self.dev.post(
            "/api/device/pair/",
            {"payload": res.data["pairPayload"]},
            format="json",
        )
        self.assertEqual(paired.status_code, 200, paired.content)
        self.assertEqual(paired.data["farm"], "South Field")

    def test_a_second_robot_joins_the_farm_without_evicting_the_first(self):
        self.pair()
        other_dev = APIClient(HTTP_AUTHORIZATION=f"Device {self.other.device_key}")
        other_dev.post(
            "/api/device/pair/", {"payload": self.qr_for(self.other)}, format="json"
        )
        farm = Farm.objects.get(name="North Field")
        self.assertEqual(sorted(farm.assigned_robots), ["ROB-9001", "ROB-9002"])

    def test_pairing_with_two_farms_leaves_the_choice_to_the_admin(self):
        # Nothing in the QR says which farm, so guessing would silently put a
        # season of readings on the wrong field.
        Farm.objects.create(name="South Field", owner=self.farmer.full_name)
        res = self.pair()
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["farm"], "")

    def test_missing_or_unreadable_payload_is_rejected(self):
        for payload in ("", "not-json", "[1,2,3]"):
            res = self.dev.post(
                "/api/device/pair/", {"payload": payload}, format="json"
            )
            self.assertEqual(res.status_code, 400, payload)

    def test_edited_payload_fails_the_signature(self):
        payload = json.loads(self.qr_for(self.robot))
        payload["fid"] = payload["fid"] + 1  # point it at a different customer
        res = self.dev.post(
            "/api/device/pair/", {"payload": json.dumps(payload)}, format="json"
        )
        self.assertEqual(res.status_code, 400)

    def test_another_robots_genuine_qr_is_rejected(self):
        # Correctly signed, same farmer, wrong machine - the case the offline
        # comparison is meant to catch, re-checked here because firmware lies.
        res = self.dev.post(
            "/api/device/pair/", {"payload": self.qr_for(self.other)}, format="json"
        )
        self.assertEqual(res.status_code, 403)
        self.assertEqual(res.json()["expected"], self.robot.id)

    def test_a_qr_cannot_be_replayed(self):
        payload = self.qr_for(self.robot)
        self.assertEqual(
            self.dev.post("/api/device/pair/", {"payload": payload}, format="json").status_code,
            200,
        )
        self.assertEqual(
            self.dev.post("/api/device/pair/", {"payload": payload}, format="json").status_code,
            409,
        )

    def test_a_stale_qr_loses_to_a_reassignment(self):
        # Code printed, then the admin gives the robot to someone else. The
        # old code is still correctly signed and must still be refused.
        payload = self.qr_for(self.robot)
        other_farmer = Farmer.objects.create(
            full_name="Sunita Jadhav", email="sunita@example.com", mobile="9999900002"
        )
        self.robot.farmer = other_farmer.full_name
        self.robot.save()

        res = self.dev.post("/api/device/pair/", {"payload": payload}, format="json")
        self.assertEqual(res.status_code, 403)

    # --- telemetry -------------------------------------------------------
    def test_a_paired_robot_can_file_a_reading(self):
        self.pair()
        res = self.telemetry(battery=77)
        self.assertEqual(res.status_code, 201, res.content)

        self.assertEqual(SensorData.objects.filter(robot=self.robot).count(), 1)
        self.robot.refresh_from_db()
        self.assertEqual(self.robot.battery, 77)

    def test_a_reading_labelled_for_another_robot_is_refused(self):
        # The check the whole device_key scheme exists for: a robot imaged
        # with the wrong config would otherwise quietly fill someone else's
        # dashboard with its readings.
        self.pair()
        res = self.telemetry(robot_id=self.other.id)
        self.assertEqual(res.status_code, 403)
        self.assertEqual(SensorData.objects.count(), 0)

    def test_robot_id_is_required(self):
        self.pair()
        body = dict(READING)
        res = self.dev.post("/api/device/telemetry/", body, format="json")
        self.assertEqual(res.status_code, 400)

    def test_an_unpaired_robot_cannot_file_readings(self):
        # Storing these would look like the robot was working, while the
        # advisory engine - which reads by farm - never saw a thing.
        res = self.telemetry()
        self.assertEqual(res.status_code, 409)
        self.assertEqual(SensorData.objects.count(), 0)

    def test_incomplete_readings_are_rejected(self):
        self.pair()
        res = self.dev.post(
            "/api/device/telemetry/",
            {"robot_id": self.robot.id, "temperature": 20},
            format="json",
        )
        self.assertEqual(res.status_code, 400)


class AccountAndPasswordResetTests(TestCase):
    """The admin's own profile, password change, and "Forgot password"."""

    def setUp(self):
        from django.core.cache import cache

        cache.clear()  # reset the password_reset throttle between tests
        self.admin = User.objects.create_user(
            username="boss@example.com",
            email="boss@example.com",
            password="Old-pass-123",
            first_name="Asha",
            last_name="Patil",
            is_staff=True,
        )
        self.client = APIClient()

    def _signed_in(self):
        self.client.force_authenticate(self.admin)
        return self.client

    def _latest_code(self):
        from django.core import mail

        return mail.outbox[-1].body.split("code is: ")[1][:6]

    # --- account -------------------------------------------------------

    def test_account_returns_signed_in_admin(self):
        res = self._signed_in().get("/api/auth/account/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["name"], "Asha Patil")
        self.assertEqual(res.data["email"], "boss@example.com")
        self.assertEqual(res.data["role"], "admin")

    def test_customer_cannot_use_account_endpoint(self):
        customer = User.objects.create_user(username="c@example.com", password="x")
        self.client.force_authenticate(customer)
        self.assertEqual(self.client.get("/api/auth/account/").status_code, 403)

    def test_changing_email_changes_the_login(self):
        res = self._signed_in().patch(
            "/api/auth/account/",
            {"email": "New@Example.com", "first_name": "Asha", "phone": "+91 98765"},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["email"], "new@example.com")
        self.assertEqual(res.data["phone"], "+91 98765")

        login = APIClient().post(
            "/api/auth/login/",
            {"username": "new@example.com", "password": "Old-pass-123"},
            format="json",
        )
        self.assertEqual(login.status_code, 200)

    def test_cannot_take_another_accounts_email(self):
        User.objects.create_user(username="taken@example.com", email="taken@example.com")
        res = self._signed_in().patch(
            "/api/auth/account/", {"email": "taken@example.com"}, format="json"
        )
        self.assertEqual(res.status_code, 400)

    # --- change password -----------------------------------------------

    def test_change_password_needs_current_password(self):
        res = self._signed_in().post(
            "/api/auth/account/password/",
            {"current_password": "wrong", "new_password": "Brand-new-456"},
            format="json",
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("current_password", res.data)

    def test_change_password_rejects_weak_password(self):
        res = self._signed_in().post(
            "/api/auth/account/password/",
            {"current_password": "Old-pass-123", "new_password": "12345678"},
            format="json",
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("new_password", res.data)

    def test_change_password(self):
        res = self._signed_in().post(
            "/api/auth/account/password/",
            {"current_password": "Old-pass-123", "new_password": "Brand-new-456"},
            format="json",
        )
        self.assertEqual(res.status_code, 204)
        self.admin.refresh_from_db()
        self.assertTrue(self.admin.check_password("Brand-new-456"))

    # --- forgot password -----------------------------------------------

    def test_full_reset_flow(self):
        from django.core import mail

        c = APIClient()
        res = c.post("/api/auth/password-reset/request/", {"email": "boss@example.com"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        code = self._latest_code()

        res = c.post(
            "/api/auth/password-reset/verify/",
            {"email": "boss@example.com", "code": code},
            format="json",
        )
        self.assertEqual(res.status_code, 200)

        res = c.post(
            "/api/auth/password-reset/confirm/",
            {"email": "boss@example.com", "code": code, "new_password": "Fresh-pass-789"},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.admin.refresh_from_db()
        self.assertTrue(self.admin.check_password("Fresh-pass-789"))

        # The code is spent.
        res = c.post(
            "/api/auth/password-reset/confirm/",
            {"email": "boss@example.com", "code": code, "new_password": "Another-pass-1"},
            format="json",
        )
        self.assertEqual(res.status_code, 400)

    def test_unknown_email_looks_the_same_and_sends_nothing(self):
        from django.core import mail

        res = APIClient().post(
            "/api/auth/password-reset/request/", {"email": "nobody@example.com"}, format="json"
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def test_customer_accounts_cannot_reset_here(self):
        from django.core import mail

        User.objects.create_user(username="farmer@example.com", email="farmer@example.com")
        APIClient().post(
            "/api/auth/password-reset/request/", {"email": "farmer@example.com"}, format="json"
        )
        self.assertEqual(len(mail.outbox), 0)

    def test_code_locks_after_too_many_wrong_guesses(self):
        from .models import PasswordResetCode

        c = APIClient()
        c.post("/api/auth/password-reset/request/", {"email": "boss@example.com"}, format="json")
        code = self._latest_code()
        wrong = "000000" if code != "000000" else "111111"
        for _ in range(PasswordResetCode.MAX_ATTEMPTS):
            c.post(
                "/api/auth/password-reset/verify/",
                {"email": "boss@example.com", "code": wrong},
                format="json",
            )
        # Even the right code no longer works.
        res = c.post(
            "/api/auth/password-reset/verify/",
            {"email": "boss@example.com", "code": code},
            format="json",
        )
        self.assertEqual(res.status_code, 400)

    def test_expired_code_is_rejected(self):
        from datetime import timedelta

        from django.utils import timezone

        from .models import PasswordResetCode

        c = APIClient()
        c.post("/api/auth/password-reset/request/", {"email": "boss@example.com"}, format="json")
        code = self._latest_code()
        PasswordResetCode.objects.update(expires_at=timezone.now() - timedelta(seconds=1))
        res = c.post(
            "/api/auth/password-reset/verify/",
            {"email": "boss@example.com", "code": code},
            format="json",
        )
        self.assertEqual(res.status_code, 400)

    def test_reset_rejects_weak_password(self):
        c = APIClient()
        c.post("/api/auth/password-reset/request/", {"email": "boss@example.com"}, format="json")
        res = c.post(
            "/api/auth/password-reset/confirm/",
            {"email": "boss@example.com", "code": self._latest_code(), "new_password": "password"},
            format="json",
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("new_password", res.data)


class EmployeeTests(TestCase):
    """Employees are staff logins managed by a master admin."""

    def setUp(self):
        self.master = User.objects.create_superuser(
            username="master@example.com", email="master@example.com", password="Master-pass-1"
        )
        self.client = APIClient()
        self.client.force_authenticate(self.master)

    def _add(self, **extra):
        data = {
            "name": "Ravi Kumar",
            "email": "ravi@example.com",
            "phone": "+91 1",
            "role": "Employee",
            "password": "Ravi-pass-123",
            **extra,
        }
        return self.client.post("/api/employees/", data, format="json")

    def test_adding_an_employee_creates_a_working_login(self):
        res = self._add()
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data["role"], "Employee")
        self.assertEqual(res.data["status"], "Active")
        self.assertNotIn("password", res.data)

        login = APIClient().post(
            "/api/auth/login/",
            {"username": "ravi@example.com", "password": "Ravi-pass-123"},
            format="json",
        )
        self.assertEqual(login.status_code, 200)

        me = APIClient()
        me.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        self.assertEqual(me.get("/api/auth/account/").data["role"], "employee")

    def test_password_required_and_must_be_strong(self):
        self.assertEqual(self._add(password="").status_code, 400)
        self.assertEqual(self._add(password="12345678").status_code, 400)

    def test_deactivating_blocks_sign_in(self):
        emp_id = self._add().data["id"]
        res = self.client.patch(f"/api/employees/{emp_id}/", {"status": "Inactive"}, format="json")
        self.assertEqual(res.status_code, 200)
        login = APIClient().post(
            "/api/auth/login/",
            {"username": "ravi@example.com", "password": "Ravi-pass-123"},
            format="json",
        )
        self.assertEqual(login.status_code, 401)

    def test_role_changes(self):
        emp_id = self._add().data["id"]
        res = self.client.patch(f"/api/employees/{emp_id}/", {"role": "Master Admin"}, format="json")
        self.assertEqual(res.data["role"], "Master Admin")
        self.assertTrue(User.objects.get(pk=emp_id).is_superuser)
        res = self.client.patch(f"/api/employees/{emp_id}/", {"role": "Admin"}, format="json")
        self.assertEqual(res.data["role"], "Admin")
        self.assertFalse(User.objects.get(pk=emp_id).is_superuser)

    def test_cannot_lock_yourself_out(self):
        url = f"/api/employees/{self.master.pk}/"
        self.assertEqual(self.client.patch(url, {"status": "Inactive"}, format="json").status_code, 400)
        self.assertEqual(self.client.patch(url, {"role": "Admin"}, format="json").status_code, 400)
        self.assertEqual(self.client.delete(url).status_code, 400)

    def test_customers_are_not_listed(self):
        User.objects.create_user(username="farmer@example.com", password="x")
        self._add()
        emails = [e["email"] for e in self.client.get("/api/employees/").data]
        self.assertEqual(sorted(emails), ["master@example.com", "ravi@example.com"])

    def test_only_master_admin_can_manage(self):
        self._add()
        plain = User.objects.get(username="ravi@example.com")
        c = APIClient()
        c.force_authenticate(plain)
        self.assertEqual(c.get("/api/employees/").status_code, 403)

    def test_delete(self):
        emp_id = self._add().data["id"]
        self.assertEqual(self.client.delete(f"/api/employees/{emp_id}/").status_code, 204)
        self.assertFalse(User.objects.filter(pk=emp_id).exists())


class NotificationSettingsTests(TestCase):
    def test_notification_toggles_are_saved(self):
        admin = User.objects.create_user(username="a@example.com", password="x", is_staff=True)
        c = APIClient()
        c.force_authenticate(admin)
        self.assertTrue(c.get("/api/auth/account/").data["notify_email"])
        res = c.patch("/api/auth/account/", {"notify_email": False}, format="json")
        self.assertFalse(res.data["notify_email"])
        self.assertFalse(c.get("/api/auth/account/").data["notify_email"])
        self.assertTrue(res.data["notify_robot_alerts"])


class CustomerPasswordTests(TestCase):
    def test_weak_customer_password_rejected(self):
        admin = User.objects.create_user(username="a@example.com", password="x", is_staff=True)
        c = APIClient()
        c.force_authenticate(admin)
        base = {"name": "Farmer", "email": "f@example.com", "phone": "1", "status": "Active"}
        self.assertEqual(c.post("/api/farmers/", {**base, "password": "abc123"}, format="json").status_code, 400)
        self.assertEqual(c.post("/api/farmers/", {**base, "password": "Good-pass-123"}, format="json").status_code, 201)
