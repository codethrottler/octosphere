from django.utils import timezone
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.approvals import create_approval_request, decide_approval_request, get_approval_request
from hrms.filters import apply_ordering
from hrms.models import AttendanceCorrection, AttendanceRecord
from hrms.pagination import GridPagination
from hrms.serializers import AttendanceCorrectionSerializer, AttendanceRecordSerializer

ATTENDANCE_ORDERING_FIELDS = {"date", "check_in", "check_out", "status"}


def _team_employee_ids(manager):
    return manager.direct_reports.values_list("id", flat=True)


class AttendanceRecordViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/hrms/attendance/records/ — mine by default; ?scope=team
    shows my direct reports' records (see docs/ARCHITECTURE.md:
    "my team" = core.User.manager direct reports, there's no separate
    Role/team-lead concept yet).
    """

    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = GridPagination
    queryset = AttendanceRecord.objects.select_related("employee").all()

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        if params.get("scope") == "team":
            qs = qs.filter(employee_id__in=_team_employee_ids(self.request.user))
        else:
            qs = qs.filter(employee=self.request.user)

        date_from = params.get("date_from")
        if date_from:
            qs = qs.filter(date__gte=date_from)
        date_to = params.get("date_to")
        if date_to:
            qs = qs.filter(date__lte=date_to)

        return apply_ordering(qs, params.get("ordering", "-date"), ATTENDANCE_ORDERING_FIELDS)


class CheckInView(APIView):
    """POST /api/hrms/attendance/check-in/ — idempotent: a second call before check-out just returns the existing record."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        today = timezone.localdate()
        record, _ = AttendanceRecord.objects.get_or_create(employee=request.user, date=today)
        if record.check_in is None:
            record.check_in = timezone.now()
            record.save(update_fields=["check_in", "updated_at"])
        return Response(AttendanceRecordSerializer(record).data)


class CheckOutView(APIView):
    """POST /api/hrms/attendance/check-out/"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        today = timezone.localdate()
        record, _ = AttendanceRecord.objects.get_or_create(employee=request.user, date=today)
        if record.check_out is None:
            record.check_out = timezone.now()
            record.save(update_fields=["check_out", "updated_at"])
        return Response(AttendanceRecordSerializer(record).data)


class AttendanceCorrectionViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet
):
    """
    List/create + approve/reject actions. No update/delete — a correction
    is either approved, rejected, or superseded by a new request, never
    edited in place.
    """

    serializer_class = AttendanceCorrectionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = GridPagination
    queryset = AttendanceCorrection.objects.select_related("record__employee").all()

    def get_queryset(self):
        qs = super().get_queryset()

        # Same reasoning as LeaveRequestViewSet: approve/reject must be able to
        # find a correction the approver didn't request themselves.
        if self.action in ("approve", "reject"):
            return qs

        if self.request.query_params.get("scope") == "team":
            return qs.filter(record__employee_id__in=_team_employee_ids(self.request.user))
        return qs.filter(requested_by=self.request.user)

    def perform_create(self, serializer):
        correction = serializer.save(requested_by=self.request.user)
        create_approval_request(
            requester=self.request.user,
            approver=correction.record.employee.manager,
            target=correction,
        )

    def _decide(self, request, pk, approved: bool):
        correction = self.get_object()
        approval = get_approval_request(correction)
        if approval is None or approval.approver_id != request.user.id:
            return Response({"detail": "Not the approver for this correction."}, status=403)
        if approval.status != "pending":
            return Response({"detail": f"Already {approval.status}."}, status=400)

        decide_approval_request(approval, approved=approved, comment=request.data.get("comment", ""))

        if approved:
            record = correction.record
            if correction.requested_check_in is not None:
                record.check_in = correction.requested_check_in
            if correction.requested_check_out is not None:
                record.check_out = correction.requested_check_out
            record.save(update_fields=["check_in", "check_out", "updated_at"])

        return Response(AttendanceCorrectionSerializer(correction).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        return self._decide(request, pk, approved=True)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        return self._decide(request, pk, approved=False)
