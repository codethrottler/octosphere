from django.conf import settings
from django.db import models


class AttendanceStatus(models.TextChoices):
    PRESENT = "present", "Present"
    ABSENT = "absent", "Absent"
    HALF_DAY = "half_day", "Half Day"
    ON_LEAVE = "on_leave", "On Leave"
    HOLIDAY = "holiday", "Holiday"
    WEEKEND = "weekend", "Weekend"


class AttendanceRecord(models.Model):
    """One row per employee per calendar date. check_in/check_out are set by the Check In / Check Out actions."""

    employee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="attendance_records")
    date = models.DateField()
    check_in = models.DateTimeField(null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=AttendanceStatus.choices, default=AttendanceStatus.PRESENT)
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("employee", "date")
        ordering = ["-date"]
        indexes = [models.Index(fields=["employee", "date"])]

    def __str__(self) -> str:
        return f"{self.employee} — {self.date}"


class AttendanceCorrection(models.Model):
    """
    A request to change an AttendanceRecord's check-in/out times.
    Approval state lives entirely in core.ApprovalRequest (via
    core.approvals, generic FK to this model) — there is no status field
    here. See docs/ARCHITECTURE.md's generic-FK pattern.
    """

    record = models.ForeignKey(AttendanceRecord, on_delete=models.CASCADE, related_name="corrections")
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="attendance_corrections_requested"
    )
    requested_check_in = models.DateTimeField(null=True, blank=True)
    requested_check_out = models.DateTimeField(null=True, blank=True)
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def get_approval(self):
        from core.approvals import get_approval_request

        return get_approval_request(self)

    def __str__(self) -> str:
        return f"Correction for {self.record}"
