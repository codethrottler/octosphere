from rest_framework import serializers

from hrms.models import AttendanceCorrection, AttendanceRecord


class AttendanceRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.get_full_name", read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = ["id", "employee", "employee_name", "date", "check_in", "check_out", "status", "notes"]
        read_only_fields = ["employee", "date", "status"]


class AttendanceCorrectionSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="record.employee.get_full_name", read_only=True)
    record_date = serializers.DateField(source="record.date", read_only=True)
    approval_status = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceCorrection
        fields = [
            "id",
            "record",
            "employee_name",
            "record_date",
            "requested_by",
            "requested_check_in",
            "requested_check_out",
            "reason",
            "approval_status",
            "created_at",
        ]
        read_only_fields = ["requested_by", "created_at"]

    def get_approval_status(self, obj: AttendanceCorrection) -> str:
        approval = obj.get_approval()
        return approval.status if approval else "pending"
