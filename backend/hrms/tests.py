from django.urls import reverse
from rest_framework.test import APITestCase

from core.models import Branch, Company, Department, Team, User
from hrms.models import EmployeeProfile, LeaveBalance, LeaveType


def make_org_tree():
    company = Company.objects.create(name="Acme Corp", code="acme")
    branch = Branch.objects.create(company=company, name="Headquarters", code="hq")
    department = Department.objects.create(branch=branch, name="Engineering", code="eng")
    team = Team.objects.create(department=department, name="Platform", code="platform")
    return team


class EmployeeProfileTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="priya", first_name="Priya", last_name="Nair", password="pw")
        self.other = User.objects.create_user(username="arjun", first_name="Arjun", last_name="Mehta", password="pw")

    def test_me_auto_creates_and_returns_profile(self):
        self.client.force_authenticate(self.user)
        self.assertFalse(EmployeeProfile.objects.filter(user=self.user).exists())

        response = self.client.get(reverse("hrms:profile-me"))

        self.assertEqual(response.status_code, 200)
        self.assertTrue(EmployeeProfile.objects.filter(user=self.user).exists())

    def test_patch_updates_own_profile(self):
        self.client.force_authenticate(self.user)

        response = self.client.patch(reverse("hrms:profile-me"), {"nationality": "Indian"}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["nationality"], "Indian")

    def test_cannot_view_others_profile_unless_staff(self):
        self.client.force_authenticate(self.user)

        response = self.client.get(reverse("hrms:profile-detail", args=[self.other.id]))

        self.assertEqual(response.status_code, 403)

    def test_staff_can_view_others_profile(self):
        self.user.is_staff = True
        self.user.save()
        self.client.force_authenticate(self.user)

        response = self.client.get(reverse("hrms:profile-detail", args=[self.other.id]))

        self.assertEqual(response.status_code, 200)


class LeaveFlowTests(APITestCase):
    def setUp(self):
        self.manager = User.objects.create_user(username="sarah", first_name="Sarah", last_name="Chen", password="pw")
        self.employee = User.objects.create_user(
            username="arjun", first_name="Arjun", last_name="Mehta", password="pw", manager=self.manager
        )
        self.leave_type = LeaveType.objects.create(name="Annual Leave", code="annual", annual_quota_days=20)

    def test_apply_leave_creates_pending_approval(self):
        self.client.force_authenticate(self.employee)

        response = self.client.post(
            reverse("hrms:leave-request-list"),
            {"leave_type": self.leave_type.id, "start_date": "2026-09-15", "end_date": "2026-09-17", "reason": "Trip"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["days_requested"], "3.0")
        self.assertEqual(response.data["approval_status"], "pending")

    def test_manager_approve_decrements_balance(self):
        self.client.force_authenticate(self.employee)
        create_response = self.client.post(
            reverse("hrms:leave-request-list"),
            {"leave_type": self.leave_type.id, "start_date": "2026-09-15", "end_date": "2026-09-17", "reason": "Trip"},
            format="json",
        )
        leave_request_id = create_response.data["id"]

        self.client.force_authenticate(self.manager)
        approve_response = self.client.post(reverse("hrms:leave-request-approve", args=[leave_request_id]))

        self.assertEqual(approve_response.status_code, 200)
        self.assertEqual(approve_response.data["approval_status"], "approved")
        balance = LeaveBalance.objects.get(employee=self.employee, leave_type=self.leave_type, year=2026)
        self.assertEqual(balance.used_days, 3)

    def test_non_manager_cannot_approve(self):
        self.client.force_authenticate(self.employee)
        create_response = self.client.post(
            reverse("hrms:leave-request-list"),
            {"leave_type": self.leave_type.id, "start_date": "2026-09-15", "end_date": "2026-09-17", "reason": "Trip"},
            format="json",
        )
        leave_request_id = create_response.data["id"]

        other = User.objects.create_user(username="wei", password="pw")
        self.client.force_authenticate(other)
        response = self.client.post(reverse("hrms:leave-request-approve", args=[leave_request_id]))

        self.assertEqual(response.status_code, 403)

    def test_cannot_approve_twice(self):
        self.client.force_authenticate(self.employee)
        create_response = self.client.post(
            reverse("hrms:leave-request-list"),
            {"leave_type": self.leave_type.id, "start_date": "2026-09-15", "end_date": "2026-09-17", "reason": "Trip"},
            format="json",
        )
        leave_request_id = create_response.data["id"]

        self.client.force_authenticate(self.manager)
        self.client.post(reverse("hrms:leave-request-approve", args=[leave_request_id]))
        second_response = self.client.post(reverse("hrms:leave-request-approve", args=[leave_request_id]))

        self.assertEqual(second_response.status_code, 400)


class AttendanceFlowTests(APITestCase):
    def setUp(self):
        self.manager = User.objects.create_user(username="sarah", first_name="Sarah", last_name="Chen", password="pw")
        self.employee = User.objects.create_user(
            username="arjun", first_name="Arjun", last_name="Mehta", password="pw", manager=self.manager
        )

    def test_check_in_then_check_out(self):
        self.client.force_authenticate(self.employee)

        check_in = self.client.post(reverse("hrms:attendance-check-in"))
        self.assertEqual(check_in.status_code, 200)
        self.assertIsNotNone(check_in.data["check_in"])
        self.assertIsNone(check_in.data["check_out"])

        check_out = self.client.post(reverse("hrms:attendance-check-out"))
        self.assertEqual(check_out.status_code, 200)
        self.assertIsNotNone(check_out.data["check_out"])

    def test_correction_approve_applies_to_record(self):
        self.client.force_authenticate(self.employee)
        self.client.post(reverse("hrms:attendance-check-in"))
        record_id = self.client.get(reverse("hrms:attendance-record-list")).data["results"][0]["id"]

        correction_response = self.client.post(
            reverse("hrms:attendance-correction-list"),
            {
                "record": record_id,
                "requested_check_in": "2026-09-08T09:00:00Z",
                "reason": "Forgot to check in on time",
            },
            format="json",
        )
        self.assertEqual(correction_response.status_code, 201)
        correction_id = correction_response.data["id"]

        self.client.force_authenticate(self.manager)
        approve_response = self.client.post(reverse("hrms:attendance-correction-approve", args=[correction_id]))

        self.assertEqual(approve_response.status_code, 200)


class EmployeeListTests(APITestCase):
    def setUp(self):
        self.team = make_org_tree()
        self.user = User.objects.create_user(username="priya", first_name="Priya", last_name="Nair", password="pw", team=self.team)

    def test_list_requires_auth(self):
        response = self.client.get(reverse("hrms:employee-list"))
        self.assertEqual(response.status_code, 401)

    def test_list_returns_employees(self):
        self.client.force_authenticate(self.user)

        response = self.client.get(reverse("hrms:employee-list"))

        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(response.data["count"], 1)

    def test_search_filters_by_name(self):
        self.client.force_authenticate(self.user)

        response = self.client.get(reverse("hrms:employee-list"), {"search": "Priya"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)


class HrmsOverviewTests(APITestCase):
    def setUp(self):
        self.team = make_org_tree()
        self.user = User.objects.create_user(
            username="priya", first_name="Priya", last_name="Nair", password="pw", team=self.team,
            employment_status="active",
        )

    def test_requires_auth(self):
        response = self.client.get(reverse("hrms:overview"))
        self.assertEqual(response.status_code, 401)

    def test_returns_real_counts(self):
        self.client.force_authenticate(self.user)

        response = self.client.get(reverse("hrms:overview"), {"period": "month"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["kpis"]["total_employees"], 1)
        self.assertEqual(response.data["kpis"]["active_employees"], 1)
        self.assertEqual(len(response.data["kpis"]["on_leave_today_trend"]), 5)
        self.assertIn("department_distribution", response.data)
