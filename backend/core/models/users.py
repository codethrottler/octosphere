from django.contrib.auth.models import AbstractUser
from django.db import models

from core.models.organization import Team


class EmploymentStatus(models.TextChoices):
    ONBOARDING = "onboarding", "Onboarding"
    ACTIVE = "active", "Active"
    ON_LEAVE = "on_leave", "On Leave"
    PROBATION = "probation", "Probation"
    OFFBOARDED = "offboarded", "Offboarded"


class User(AbstractUser):
    """
    The single identity used everywhere: HRMS employee, ticket requester/
    assignee, approval requester/approver, audit actor. Full HRMS profile
    fields (emergency contacts, bank details, documents, etc. — see the
    nav tree's "My Profile") are deliberately NOT here yet; this is the
    lean core identity + org placement the next HRMS session builds on.
    """

    employee_code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    title = models.CharField(max_length=150, blank=True)
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name="members")
    manager = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="direct_reports"
    )
    employment_status = models.CharField(
        max_length=20, choices=EmploymentStatus.choices, default=EmploymentStatus.ACTIVE
    )
    date_joined_company = models.DateField(null=True, blank=True)

    def __str__(self) -> str:
        return self.get_full_name() or self.username
