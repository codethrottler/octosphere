from rest_framework import serializers

from core.models import Branch, Company, Department, Team, User


class EmployeeListSerializer(serializers.ModelSerializer):
    """
    Backs Employee Directory + Employee List (the first AG-Grid table).
    Joins core.User with its hrms profile/designation — read-only, no
    create/update here (onboarding is a future session's job, see
    docs/MODULE_PLAN.md).
    """

    name = serializers.SerializerMethodField()
    designation_name = serializers.SerializerMethodField()
    department_name = serializers.CharField(source="team.department.name", default=None, read_only=True)
    team_name = serializers.CharField(source="team.name", default=None, read_only=True)
    branch_name = serializers.CharField(source="team.department.branch.name", default=None, read_only=True)
    manager_name = serializers.SerializerMethodField()
    phone_number = serializers.CharField(source="hrms_profile.phone_number", default="", read_only=True)
    work_location = serializers.CharField(source="hrms_profile.work_location", default="", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "employee_code",
            "name",
            "email",
            "title",
            "designation_name",
            "department_name",
            "team_name",
            "branch_name",
            "manager_name",
            "employment_status",
            "date_joined_company",
            "phone_number",
            "work_location",
        ]

    def get_name(self, obj: User) -> str:
        return obj.get_full_name() or obj.username

    def get_designation_name(self, obj: User) -> str | None:
        profile = getattr(obj, "hrms_profile", None)
        if profile and profile.designation_id:
            return profile.designation.name
        return obj.title or None

    def get_manager_name(self, obj: User) -> str | None:
        return obj.manager.get_full_name() if obj.manager else None


class TeamSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    employee_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Team
        fields = ["id", "name", "code", "department", "department_name", "employee_count"]


class DepartmentSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    employee_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Department
        fields = ["id", "name", "code", "branch", "branch_name", "employee_count"]


class OrgTeamNodeSerializer(serializers.ModelSerializer):
    employee_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Team
        fields = ["id", "name", "employee_count"]


class OrgDepartmentNodeSerializer(serializers.ModelSerializer):
    teams = OrgTeamNodeSerializer(many=True, read_only=True)

    class Meta:
        model = Department
        fields = ["id", "name", "teams"]


class OrgBranchNodeSerializer(serializers.ModelSerializer):
    departments = OrgDepartmentNodeSerializer(many=True, read_only=True)

    class Meta:
        model = Branch
        fields = ["id", "name", "departments"]


class OrgCompanyNodeSerializer(serializers.ModelSerializer):
    branches = OrgBranchNodeSerializer(many=True, read_only=True)

    class Meta:
        model = Company
        fields = ["id", "name", "branches"]
