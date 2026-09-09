"""
Small helper around core.ApprovalRequest's generic FK so a module (hrms
today, my_work/service_desk later) can create/query approvals against any
model without its own approval status field or approval table. See
docs/ARCHITECTURE.md's "Generic-FK pattern".

Deliberately lives in `core`, not `hrms`: it only knows about
ApprovalRequest + ContentType, never about LeaveRequest/AttendanceCorrection/
etc. — the caller passes the target object in and gets/sets state on it via
the generic FK, keeping this reusable across every future module that needs
a yes/no decision.
"""

from django.contrib.contenttypes.models import ContentType
from django.db import models

from core.models.workflow import ApprovalRequest, ApprovalStatus


def create_approval_request(*, requester, approver, target: models.Model, comment: str = "") -> ApprovalRequest:
    """Open a new pending approval pointed at `target`."""
    return ApprovalRequest.objects.create(
        requester=requester,
        approver=approver,
        content_type=ContentType.objects.get_for_model(target),
        object_id=target.pk,
        comment=comment,
    )


def get_approval_request(target: models.Model) -> ApprovalRequest | None:
    """The most recent approval request opened against `target`, if any."""
    content_type = ContentType.objects.get_for_model(target)
    return (
        ApprovalRequest.objects.filter(content_type=content_type, object_id=target.pk)
        .order_by("-requested_at")
        .first()
    )


def decide_approval_request(approval: ApprovalRequest, *, approved: bool, comment: str = "") -> ApprovalRequest:
    """
    Flip a pending approval to approved/rejected. Caller is responsible for
    checking request.user is the approval's approver, and for applying any
    domain-specific side effect (e.g. decrementing a leave balance).
    """
    from django.utils import timezone

    approval.status = ApprovalStatus.APPROVED if approved else ApprovalStatus.REJECTED
    approval.decided_at = timezone.now()
    if comment:
        approval.comment = comment
    approval.save(update_fields=["status", "decided_at", "comment"])
    return approval
