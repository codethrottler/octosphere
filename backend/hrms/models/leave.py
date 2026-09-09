from django.conf import settings
from django.db import models


class LeaveType(models.Model):
    """
    Admin-configurable leave types (Casual, Sick, Annual, ...) — editable
    via Django admin today; a real "HR Administration > Leave Policies"
    UI is a follow-on, not built this session. Deliberately a real table,
    not a hardcoded TextChoices enum, since the list changing shouldn't
    need a migration.
    """

    name = models.CharField(max_length=100, unique=True)
    code = models.SlugField(max_length=40, unique=True)
    annual_quota_days = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    carry_forward_allowed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class LeaveBalance(models.Model):
    """One row per (employee, leave type, year). `used_days` is incremented when a LeaveRequest is approved."""

    employee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="leave_balances")
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE, related_name="balances")
    year = models.PositiveSmallIntegerField()
    allocated_days = models.DecimalField(max_digits=5, decimal_places=1)
    used_days = models.DecimalField(max_digits=5, decimal_places=1, default=0)

    class Meta:
        unique_together = ("employee", "leave_type", "year")
        ordering = ["-year", "leave_type__name"]

    @property
    def remaining_days(self):
        return self.allocated_days - self.used_days

    def __str__(self) -> str:
        return f"{self.employee} / {self.leave_type} / {self.year}"


class LeaveRequest(models.Model):
    """
    An employee's leave application. Deliberately has NO status field —
    approval state lives entirely in core.ApprovalRequest (via
    core.approvals, generic FK to this model). Query get_approval() /
    core.approvals.get_approval_request(request) for current status,
    rather than trusting a duplicated field here. See
    docs/ARCHITECTURE.md's generic-FK pattern and "using the core
    approval engine, not a leave-specific one".
    """

    employee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="leave_requests")
    leave_type = models.ForeignKey(LeaveType, on_delete=models.PROTECT, related_name="requests")
    start_date = models.DateField()
    end_date = models.DateField()
    days_requested = models.DecimalField(max_digits=5, decimal_places=1)
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def get_approval(self):
        from core.approvals import get_approval_request

        return get_approval_request(self)

    def __str__(self) -> str:
        return f"{self.employee} / {self.leave_type} / {self.start_date}–{self.end_date}"
