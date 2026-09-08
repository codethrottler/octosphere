from django.db import models

from core.models.tickets import Desk, TicketPriority


class SLAPolicy(models.Model):
    """
    One response/resolution target per (desk, priority). Ticket.sla_due_at
    is computed from this at creation time (see the Service Desk module,
    not built this session) — this table is the policy, not the per-ticket
    clock.
    """

    desk = models.CharField(max_length=16, choices=Desk.choices)
    priority = models.CharField(max_length=16, choices=TicketPriority.choices)
    response_time_minutes = models.PositiveIntegerField()
    resolution_time_minutes = models.PositiveIntegerField()

    class Meta:
        unique_together = ("desk", "priority")
        verbose_name = "SLA policy"
        verbose_name_plural = "SLA policies"

    def __str__(self) -> str:
        return f"{self.get_desk_display()} / {self.get_priority_display()}"
