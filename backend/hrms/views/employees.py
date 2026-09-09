from django.db.models import Count, Prefetch, Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Company, Department, Team, User
from hrms.filters import apply_ordering
from hrms.pagination import GridPagination
from hrms.serializers import DepartmentSerializer, EmployeeListSerializer, OrgCompanyNodeSerializer, TeamSerializer

EMPLOYEE_ORDERING_FIELDS = {"employee_code", "first_name", "last_name", "date_joined_company", "employment_status"}


class EmployeeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Employee Directory + Employee List — the first AG-Grid table (see
    docs/CONVENTIONS.md). GridPagination (limit/offset) + manual
    search/department/team/status filters + a whitelisted `ordering`
    param, read from query params rather than a filter library — see
    hrms/filters.py.
    """

    serializer_class = EmployeeListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = GridPagination
    queryset = User.objects.select_related(
        "team__department__branch__company", "manager", "hrms_profile", "hrms_profile__designation"
    ).all()

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        search = params.get("search")
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(employee_code__icontains=search)
            )

        department = params.get("department")
        if department:
            qs = qs.filter(team__department_id=department)

        team = params.get("team")
        if team:
            qs = qs.filter(team_id=team)

        status_param = params.get("status")
        if status_param:
            qs = qs.filter(employment_status=status_param)

        return apply_ordering(qs, params.get("ordering"), EMPLOYEE_ORDERING_FIELDS)


class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only browse. Creating/editing departments belongs to Administration > Organization, not built yet."""

    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    queryset = Department.objects.select_related("branch").annotate(
        employee_count=Count("teams__members", distinct=True)
    )


class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]
    queryset = Team.objects.select_related("department").annotate(employee_count=Count("members", distinct=True))


class OrgStructureView(APIView):
    """GET /api/hrms/org-structure/ — the full Company -> Branch -> Department -> Team tree with employee counts."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        teams_with_counts = Team.objects.annotate(employee_count=Count("members", distinct=True))
        companies = Company.objects.prefetch_related(
            "branches",
            "branches__departments",
            Prefetch("branches__departments__teams", queryset=teams_with_counts),
        )
        return Response(OrgCompanyNodeSerializer(companies, many=True).data)
