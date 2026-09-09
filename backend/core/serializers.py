from rest_framework import serializers

from core.models import User


class CurrentUserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()
    team_name = serializers.CharField(source="team.name", default=None, read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "name",
            "initials",
            "employee_code",
            "title",
            "team_name",
            "employment_status",
            "is_staff",
        ]

    def get_name(self, obj: User) -> str:
        return obj.get_full_name() or obj.username

    def get_initials(self, obj: User) -> str:
        name = self.get_name(obj)
        parts = [p for p in name.split() if p]
        if not parts:
            return "?"
        if len(parts) == 1:
            return parts[0][:2].upper()
        return (parts[0][0] + parts[-1][0]).upper()
