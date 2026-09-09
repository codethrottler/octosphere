from datetime import timedelta

from django.db.models import Count
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Department, User
from hrms.models import AttendanceRecord, AttendanceStatus, LeaveRequest

PERIOD_DAYS = {"today": 1, "week": 7, "month": 30, "quarter": 90}

DEPARTMENT_COLORS = [
    "var(--color-brand-500)",
    "var(--color-info-500)",
    "var(--color-success-500)",
    "var(--color-warning-500)",
    "var(--color-desk-hr)",
    "var(--color-ink-300)",
]

TREND_POINTS = 5


class HrmsOverviewView(APIView):
    """
    GET /api/hrms/overview/?period=today|week|month|quarter — replaces
    the mock data behind HrmsOverviewPage (see
    frontend/src/modules/hrms/mockData.ts's docstring: "this is the
    small diff the mock-data-file isolation was meant to enable").

    Real numbers throughout, no fabricated history: Total/Active
    Employees and Exits are point-in-time snapshots (flat trend — there's
    no headcount-history table to chart a real trend from). On Leave
    Today and Attendance Rate use real per-day AttendanceRecord data for
    their trend; New Joiners uses real date_joined_company buckets.
    "Exits" is a snapshot count of employment_status=offboarded, not
    period-scoped — core.User has no exit_date field yet to scope it by.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.query_params.get("period", "month")
        days = PERIOD_DAYS.get(period, 30)
        today = timezone.localdate()

        total_employees = User.objects.count()
        active_employees = User.objects.filter(employment_status="active").count()
        exits = User.objects.filter(employment_status="offboarded").count()

        on_leave_today = self._count_on_leave(today)
        on_leave_trend = [self._count_on_leave(today - timedelta(days=offset)) for offset in range(TREND_POINTS - 1, -1, -1)]

        new_joiners, new_joiners_trend = self._new_joiners(today, days)
        attendance_rate, attendance_trend = self._attendance_rate(today, days)

        return Response(
            {
                "kpis": {
                    "total_employees": total_employees,
                    "active_employees": active_employees,
                    "on_leave_today": on_leave_today,
                    "on_leave_today_trend": on_leave_trend,
                    "new_joiners": new_joiners,
                    "new_joiners_trend": new_joiners_trend,
                    "exits": exits,
                    "attendance_rate": attendance_rate,
                    "attendance_rate_trend": attendance_trend,
                },
                "department_distribution": self._department_distribution(),
                "calendar_highlights": self._calendar_highlights(today),
                "activity": self._recent_activity(),
            }
        )

    def _count_on_leave(self, date) -> int:
        return AttendanceRecord.objects.filter(date=date, status=AttendanceStatus.ON_LEAVE).count()

    def _new_joiners(self, today, days: int) -> tuple[int, list[int]]:
        period_start = today - timedelta(days=days - 1)
        count = User.objects.filter(date_joined_company__gte=period_start, date_joined_company__lte=today).count()

        bucket_size = max(1, days // TREND_POINTS)
        trend = []
        for i in range(TREND_POINTS - 1, -1, -1):
            bucket_end = today - timedelta(days=i * bucket_size)
            bucket_start = bucket_end - timedelta(days=bucket_size - 1)
            trend.append(User.objects.filter(date_joined_company__gte=bucket_start, date_joined_company__lte=bucket_end).count())
        return count, trend

    def _attendance_rate(self, today, days: int) -> tuple[float, list[float]]:
        period_start = today - timedelta(days=days - 1)
        rate = self._rate_for_range(period_start, today)

        bucket_size = max(1, days // TREND_POINTS)
        trend = []
        for i in range(TREND_POINTS - 1, -1, -1):
            bucket_end = today - timedelta(days=i * bucket_size)
            bucket_start = bucket_end - timedelta(days=bucket_size - 1)
            trend.append(self._rate_for_range(bucket_start, bucket_end))
        return rate, trend

    def _rate_for_range(self, start, end) -> float:
        working_statuses = [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.HALF_DAY]
        records = AttendanceRecord.objects.filter(date__gte=start, date__lte=end, status__in=working_statuses)
        total = records.count()
        if total == 0:
            return 0.0
        present = records.filter(status=AttendanceStatus.PRESENT).count()
        return round((present / total) * 100, 1)

    def _department_distribution(self):
        departments = Department.objects.annotate(employee_count=Count("teams__members", distinct=True)).order_by(
            "-employee_count"
        )
        return [
            {"name": d.name, "value": d.employee_count, "color": DEPARTMENT_COLORS[i % len(DEPARTMENT_COLORS)]}
            for i, d in enumerate(departments)
        ]

    def _calendar_highlights(self, today):
        highlights = []
        upcoming = LeaveRequest.objects.filter(start_date__gte=today).select_related("employee", "leave_type").order_by(
            "start_date"
        )[:6]
        for leave_request in upcoming:
            approval = leave_request.get_approval()
            tone = {"pending": "warning", "approved": "success", "rejected": "danger"}.get(
                approval.status if approval else "pending", "brand"
            )
            highlights.append(
                {
                    "date": leave_request.start_date.isoformat(),
                    "label": f"{leave_request.employee.get_full_name()} — {leave_request.leave_type.name}",
                    "tone": tone,
                }
            )
        return highlights

    def _recent_activity(self):
        items = []
        for leave_request in LeaveRequest.objects.select_related("employee", "leave_type").order_by("-created_at")[:6]:
            items.append(
                {
                    "id": f"leave_{leave_request.id}",
                    "label": f"{leave_request.employee.get_full_name()} applied for {leave_request.leave_type.name} ({leave_request.start_date} – {leave_request.end_date}).",
                    "timestamp": leave_request.created_at.isoformat(),
                }
            )
        return items
