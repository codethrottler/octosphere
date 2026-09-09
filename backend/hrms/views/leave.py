from decimal import Decimal

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.approvals import create_approval_request, decide_approval_request, get_approval_request
from hrms.filters import apply_ordering
from hrms.models import LeaveBalance, LeaveRequest, LeaveType
from hrms.pagination import GridPagination
from hrms.serializers import LeaveBalanceSerializer, LeaveRequestSerializer, LeaveTypeSerializer

LEAVE_ORDERING_FIELDS = {"start_date", "end_date", "created_at", "days_requested"}


class LeaveTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """Editable via Django admin (see docs/MODULE_PLAN.md — no HR Administration UI yet)."""

    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsAuthenticated]


class LeaveBalanceViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/hrms/leave/balances/ — the authenticated user's own balances, current + past years."""

    serializer_class = LeaveBalanceSerializer
    permission_classes = [IsAuthenticated]
    queryset = LeaveBalance.objects.select_related("leave_type").all()

    def get_queryset(self):
        return super().get_queryset().filter(employee=self.request.user)


class LeaveRequestViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    List/apply + approve/reject. Mine by default; ?scope=team lists my
    direct reports' requests (for the Approvals view). No update/delete —
    same reasoning as AttendanceCorrection.
    """

    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = GridPagination
    queryset = LeaveRequest.objects.select_related("employee", "leave_type").all()

    def get_queryset(self):
        qs = super().get_queryset()

        # approve/reject target requests the manager doesn't own — scoping by
        # employee/team here would 404 a legitimate approver. The _decide()
        # approver check below is what actually authorizes those actions.
        if self.action in ("approve", "reject"):
            return qs

        if self.request.query_params.get("scope") == "team":
            qs = qs.filter(employee__manager=self.request.user)
        else:
            qs = qs.filter(employee=self.request.user)
        return apply_ordering(qs, self.request.query_params.get("ordering", "-created_at"), LEAVE_ORDERING_FIELDS)

    def perform_create(self, serializer):
        days_requested = Decimal((serializer.validated_data["end_date"] - serializer.validated_data["start_date"]).days + 1)
        leave_request = serializer.save(employee=self.request.user, days_requested=days_requested)
        create_approval_request(
            requester=self.request.user,
            approver=self.request.user.manager,
            target=leave_request,
        )

    def _decide(self, request, pk, approved: bool):
        leave_request = self.get_object()
        approval = get_approval_request(leave_request)
        if approval is None or approval.approver_id != request.user.id:
            return Response({"detail": "Not the approver for this leave request."}, status=403)
        if approval.status != "pending":
            return Response({"detail": f"Already {approval.status}."}, status=400)

        decide_approval_request(approval, approved=approved, comment=request.data.get("comment", ""))

        if approved:
            balance, _ = LeaveBalance.objects.get_or_create(
                employee=leave_request.employee,
                leave_type=leave_request.leave_type,
                year=leave_request.start_date.year,
                defaults={"allocated_days": leave_request.leave_type.annual_quota_days},
            )
            balance.used_days = balance.used_days + leave_request.days_requested
            balance.save(update_fields=["used_days"])

        return Response(LeaveRequestSerializer(leave_request).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        return self._decide(request, pk, approved=True)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        return self._decide(request, pk, approved=False)


class LeaveApprovalsView(APIView):
    """
    GET /api/hrms/leave/approvals/pending-count/ — small helper for a KPI
    tile (pending leave approvals awaiting me), separate from the list
    endpoint above so the Overview dashboard doesn't have to paginate
    through requests just to get a count.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        team_requests = list(LeaveRequest.objects.filter(employee__manager=request.user))
        pending_count = 0
        for leave_request in team_requests:
            approval = leave_request.get_approval()
            if approval and approval.status == "pending":
                pending_count += 1
        return Response({"team_requests_total": len(team_requests), "pending_my_approval": pending_count})
