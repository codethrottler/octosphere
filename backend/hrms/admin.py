from django.contrib import admin

from hrms.models import (
    AttendanceCorrection,
    AttendanceRecord,
    BankAccount,
    Designation,
    EmergencyContact,
    EmployeeProfile,
    EmployeeSkill,
    LeaveBalance,
    LeaveRequest,
    LeaveType,
    ProfileDocument,
    Qualification,
    Skill,
)


class EmergencyContactInline(admin.TabularInline):
    model = EmergencyContact
    extra = 0


class EmployeeSkillInline(admin.TabularInline):
    model = EmployeeSkill
    extra = 0


class QualificationInline(admin.TabularInline):
    model = Qualification
    extra = 0


@admin.register(EmployeeProfile)
class EmployeeProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "designation", "employment_type", "work_location")
    list_filter = ("employment_type", "designation")
    search_fields = ("user__username", "user__first_name", "user__last_name")
    inlines = [EmergencyContactInline, EmployeeSkillInline, QualificationInline]


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = ("profile", "bank_name", "account_number", "account_type")


@admin.register(ProfileDocument)
class ProfileDocumentAdmin(admin.ModelAdmin):
    list_display = ("original_filename", "document_type", "profile", "uploaded_at")
    list_filter = ("document_type",)


@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "level")


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("employee", "date", "check_in", "check_out", "status")
    list_filter = ("status",)
    search_fields = ("employee__username", "employee__first_name", "employee__last_name")


@admin.register(AttendanceCorrection)
class AttendanceCorrectionAdmin(admin.ModelAdmin):
    list_display = ("record", "requested_by", "created_at")


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "annual_quota_days", "carry_forward_allowed")


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ("employee", "leave_type", "year", "allocated_days", "used_days")
    list_filter = ("leave_type", "year")
    search_fields = ("employee__username", "employee__first_name", "employee__last_name")


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ("employee", "leave_type", "start_date", "end_date", "days_requested")
    list_filter = ("leave_type",)
    search_fields = ("employee__username", "employee__first_name", "employee__last_name")
