"""
python manage.py seed_demo_data

Builds a realistic-enough Company -> Branch -> Department -> Team tree,
a handful of employees with HRMS profiles, leave types/balances, and a
few days of attendance + some leave/attendance-correction requests (some
pending, some decided) so every screen built this session has real data
to show instead of an empty state. Safe to re-run — get_or_create
throughout.
"""

import random
from datetime import timedelta

from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.utils import timezone

from core.approvals import create_approval_request, decide_approval_request
from core.models import Branch, Company, Department, Team, User
from hrms.models import (
    AttendanceRecord,
    AttendanceStatus,
    Designation,
    EmployeeProfile,
    LeaveBalance,
    LeaveRequest,
    LeaveType,
)

DEMO_PASSWORD = "octosphere123"


class Command(BaseCommand):
    help = "Seed demo org structure, employees, leave, and attendance data."

    def handle(self, *args, **options):
        random.seed(42)

        company = self._seed_org_tree()
        designations = self._seed_designations()
        leave_types = self._seed_leave_types()
        users = self._seed_users(company, designations)
        self._seed_leave_balances(users, leave_types)
        self._seed_attendance(users)
        self._seed_leave_requests(users, leave_types)
        self._seed_superuser()

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(users)} employees under {company.name}."))
        self.stdout.write(f"Log in as any employee below with password: {DEMO_PASSWORD}")
        for u in users:
            self.stdout.write(f"  {u.username:12s} {u.get_full_name()}")
        self.stdout.write("Django admin superuser: admin / octosphere123")

    def _seed_org_tree(self):
        company, _ = Company.objects.get_or_create(code="acme", defaults={"name": "Acme Corp"})
        branch, _ = Branch.objects.get_or_create(
            company=company, code="hq", defaults={"name": "Headquarters", "city": "Bengaluru", "country": "India"}
        )
        self.departments = {}
        self.teams = {}
        dept_team_names = {
            "Engineering": ["Platform", "Product"],
            "Sales": ["Enterprise Sales"],
            "Operations": ["Facilities"],
            "Customer Support": ["Support"],
            "Finance": ["Accounting"],
        }
        for dept_name, team_names in dept_team_names.items():
            dept, _ = Department.objects.get_or_create(
                branch=branch, code=dept_name.lower().replace(" ", "-"), defaults={"name": dept_name}
            )
            self.departments[dept_name] = dept
            for team_name in team_names:
                team, _ = Team.objects.get_or_create(
                    department=dept, code=team_name.lower().replace(" ", "-"), defaults={"name": team_name}
                )
                self.teams[team_name] = team
        return company

    def _seed_designations(self):
        names = [
            ("Software Engineer", "sw-eng", 1),
            ("Senior Software Engineer", "sr-sw-eng", 2),
            ("Engineering Manager", "eng-mgr", 4),
            ("Sales Executive", "sales-exec", 1),
            ("HR Business Partner", "hr-bp", 3),
            ("Finance Analyst", "fin-analyst", 1),
            ("Support Specialist", "support-spec", 1),
            ("Facilities Coordinator", "facilities-coord", 1),
        ]
        designations = {}
        for name, code, level in names:
            d, _ = Designation.objects.get_or_create(code=code, defaults={"name": name, "level": level})
            designations[name] = d
        return designations

    def _seed_leave_types(self):
        specs = [
            ("Annual Leave", "annual", 20, True),
            ("Casual Leave", "casual", 12, False),
            ("Sick Leave", "sick", 10, False),
            ("Unpaid Leave", "unpaid", 0, False),
        ]
        leave_types = {}
        for name, code, quota, carry in specs:
            lt, _ = LeaveType.objects.get_or_create(
                code=code, defaults={"name": name, "annual_quota_days": quota, "carry_forward_allowed": carry}
            )
            leave_types[code] = lt
        return leave_types

    def _seed_users(self, company, designations):
        specs = [
            # username, first, last, team, designation, title, status, manager_username
            ("sarah.chen", "Sarah", "Chen", "Platform", "Engineering Manager", "Engineering Manager", "active", None),
            ("priya.nair", "Priya", "Nair", "Platform", "Engineering Manager", "Engineering Manager", "active", "sarah.chen"),
            ("arjun.mehta", "Arjun", "Mehta", "Platform", "Senior Software Engineer", "Senior Software Engineer", "active", "priya.nair"),
            ("wei.zhang", "Wei", "Zhang", "Platform", "Software Engineer", "Software Engineer", "active", "priya.nair"),
            ("fatima.alsayed", "Fatima", "Al-Sayed", "Product", "Software Engineer", "Software Engineer", "active", "priya.nair"),
            ("daniel.osei", "Daniel", "Osei", "Enterprise Sales", "Sales Executive", "Sales Executive", "probation", "sarah.chen"),
            ("neha.kapoor", "Neha", "Kapoor", "Support", "Support Specialist", "Support Specialist", "onboarding", "sarah.chen"),
            ("ravi.kumar", "Ravi", "Kumar", "Accounting", "Finance Analyst", "Finance Analyst", "active", "sarah.chen"),
            ("marcus.webb", "Marcus", "Webb", "Facilities", "Facilities Coordinator", "Facilities Coordinator", "offboarded", "sarah.chen"),
        ]

        users_by_username = {}
        for username, first, last, team_name, designation_name, title, status, manager_username in specs:
            user, created = User.objects.get_or_create(
                username=username,
                defaults=dict(
                    first_name=first,
                    last_name=last,
                    email=f"{username}@acme.example",
                    password=make_password(DEMO_PASSWORD),
                    employee_code=f"EMP{1000 + len(users_by_username)}",
                    title=title,
                    team=self.teams[team_name],
                    employment_status=status,
                    date_joined_company=timezone.now().date() - timedelta(days=random.randint(60, 900)),
                    is_staff=(username == "sarah.chen"),
                ),
            )
            if manager_username:
                user.manager = users_by_username.get(manager_username)
                user.save(update_fields=["manager"])
            users_by_username[username] = user

            EmployeeProfile.objects.get_or_create(
                user=user,
                defaults=dict(
                    designation=designations[designation_name],
                    employment_type="full_time",
                    work_location="Bengaluru HQ",
                    nationality="Indian",
                ),
            )

        return list(users_by_username.values())

    def _seed_leave_balances(self, users, leave_types):
        year = timezone.now().year
        for user in users:
            for code, leave_type in leave_types.items():
                if leave_type.annual_quota_days == 0:
                    continue
                LeaveBalance.objects.get_or_create(
                    employee=user,
                    leave_type=leave_type,
                    year=year,
                    defaults={
                        "allocated_days": leave_type.annual_quota_days,
                        "used_days": random.choice([0, 1, 2, 3, 5]),
                    },
                )

    def _seed_attendance(self, users):
        today = timezone.localdate()
        for user in users:
            for offset in range(14):
                day = today - timedelta(days=offset)
                if day.weekday() >= 5:
                    status = AttendanceStatus.WEEKEND
                else:
                    status = random.choices(
                        [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.ON_LEAVE],
                        weights=[90, 5, 5],
                    )[0]
                check_in = check_out = None
                if status == AttendanceStatus.PRESENT:
                    hour = random.choice([9, 9, 9, 10])
                    minute = random.randint(0, 45)
                    check_in = timezone.make_aware(
                        timezone.datetime(day.year, day.month, day.day, hour, minute)
                    )
                    check_out = check_in + timedelta(hours=random.choice([8, 9]))
                AttendanceRecord.objects.get_or_create(
                    employee=user,
                    date=day,
                    defaults={"status": status, "check_in": check_in, "check_out": check_out},
                )

    def _seed_leave_requests(self, users, leave_types):
        # A couple of decided requests + a couple pending, so Leave Approvals has something to act on.
        specs = [
            ("arjun.mehta", "annual", 10, True),
            ("wei.zhang", "casual", 2, False),
            ("fatima.alsayed", "sick", 1, True),
        ]
        users_by_username = {u.username: u for u in users}
        for username, leave_code, days_ago_start, decide in specs:
            employee = users_by_username[username]
            if not employee.manager_id:
                continue
            start = timezone.localdate() + timedelta(days=days_ago_start)
            end = start + timedelta(days=1)
            leave_request, created = LeaveRequest.objects.get_or_create(
                employee=employee,
                leave_type=leave_types[leave_code],
                start_date=start,
                defaults={"end_date": end, "days_requested": 2, "reason": "Personal time off"},
            )
            if not created:
                continue
            approval = create_approval_request(requester=employee, approver=employee.manager, target=leave_request)
            if decide:
                decide_approval_request(approval, approved=True, comment="Approved — enjoy!")
                # Mirror the side effect hrms.views.leave.LeaveRequestViewSet._decide applies on approval.
                balance, _ = LeaveBalance.objects.get_or_create(
                    employee=employee,
                    leave_type=leave_request.leave_type,
                    year=start.year,
                    defaults={"allocated_days": leave_request.leave_type.annual_quota_days},
                )
                balance.used_days = balance.used_days + leave_request.days_requested
                balance.save(update_fields=["used_days"])

    def _seed_superuser(self):
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser(username="admin", email="admin@acme.example", password=DEMO_PASSWORD)
