from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class NotificationCategory(models.TextChoices):
    TASK = "task", "Task"
    TICKET = "ticket", "Ticket"
    APPROVAL = "approval", "Approval"
    LEAVE = "leave", "Leave"
    SYSTEM = "system", "System"


class Notification(models.Model):
    """
    One notification model for the whole platform. `target` is a generic
    FK so a notification can point at a Ticket today and a Task or
    ApprovalRequest once those modules exist, without adding a new
    notification table per module.
    """

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    category = models.CharField(max_length=16, choices=NotificationCategory.choices)
    title = models.CharField(max_length=255)
    body = models.CharField(max_length=500, blank=True)

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    target = GenericForeignKey("content_type", "object_id")

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["recipient", "is_read"])]

    def __str__(self) -> str:
        return self.title
