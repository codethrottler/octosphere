from django.conf import settings
from django.db import models


class Desk(models.TextChoices):
    """The 3 desks users see. They are a VIEW over one ticket table, not 3 separate schemas."""

    HR = "hr", "HR Desk"
    IT = "it", "IT & Network Desk"
    ADMIN = "admin", "Admin Desk"


class TicketStatus(models.TextChoices):
    OPEN = "open", "Open"
    IN_PROGRESS = "in_progress", "In Progress"
    PENDING = "pending", "Pending"
    RESOLVED = "resolved", "Resolved"
    CLOSED = "closed", "Closed"


class TicketPriority(models.TextChoices):
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    HIGH = "high", "High"
    URGENT = "urgent", "Urgent"


class Ticket(models.Model):
    """
    One model family for all 3 service desks, discriminated by `desk` —
    see docs/ARCHITECTURE.md "Ticket engine". Desk-specific structured
    data (e.g. an IT ticket's asset tag, an HR ticket's leave type) goes
    in `extra`, not in desk-specific columns or desk-specific tables —
    that's what keeps this one table instead of three.
    """

    desk = models.CharField(max_length=16, choices=Desk.choices, db_index=True)
    reference_code = models.CharField(max_length=20, unique=True)
    category = models.CharField(max_length=100, blank=True)
    subcategory = models.CharField(max_length=100, blank=True)
    subject = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=16, choices=TicketStatus.choices, default=TicketStatus.OPEN, db_index=True
    )
    priority = models.CharField(max_length=16, choices=TicketPriority.choices, default=TicketPriority.MEDIUM)
    extra = models.JSONField(default=dict, blank=True)

    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="tickets_raised"
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tickets_assigned",
    )

    sla_policy = models.ForeignKey(
        "core.SLAPolicy", on_delete=models.SET_NULL, null=True, blank=True, related_name="tickets"
    )
    sla_due_at = models.DateTimeField(null=True, blank=True)
    sla_breached = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["desk", "status"])]

    def __str__(self) -> str:
        return f"{self.reference_code} — {self.subject}"


class TicketComment(models.Model):
    """Shared comment system — one model, works for every desk since it points at Ticket, not a desk-specific type."""

    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="ticket_comments")
    body = models.TextField()
    is_internal = models.BooleanField(default=False, help_text="Internal note vs. a reply visible to the requester")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"Comment on {self.ticket.reference_code} by {self.author}"


class TicketAttachment(models.Model):
    """Shared attachment system — same reasoning as TicketComment."""

    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="attachments")
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="ticket_attachments"
    )
    file = models.FileField(upload_to="ticket_attachments/%Y/%m/")
    original_filename = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.original_filename
