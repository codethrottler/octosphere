from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from core.models import (
    ApprovalRequest,
    AuditLogEntry,
    Branch,
    Company,
    Department,
    Notification,
    SLAPolicy,
    Team,
    Ticket,
    TicketAttachment,
    TicketComment,
    User,
)


@admin.register(User)
class OctoSphereUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("OctoSphere", {"fields": ("employee_code", "title", "team", "manager", "employment_status", "date_joined_company")}),
    )
    list_display = ("username", "email", "first_name", "last_name", "team", "employment_status", "is_staff")
    list_filter = UserAdmin.list_filter + ("employment_status",)


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "code")


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "company")
    list_filter = ("company",)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "branch")
    list_filter = ("branch__company", "branch")


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "department")
    list_filter = ("department",)


class TicketCommentInline(admin.TabularInline):
    model = TicketComment
    extra = 0


class TicketAttachmentInline(admin.TabularInline):
    model = TicketAttachment
    extra = 0


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("reference_code", "desk", "subject", "status", "priority", "requester", "assignee", "created_at")
    list_filter = ("desk", "status", "priority")
    search_fields = ("reference_code", "subject", "description")
    inlines = [TicketCommentInline, TicketAttachmentInline]


@admin.register(SLAPolicy)
class SLAPolicyAdmin(admin.ModelAdmin):
    list_display = ("desk", "priority", "response_time_minutes", "resolution_time_minutes")
    list_filter = ("desk", "priority")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "recipient", "is_read", "created_at")
    list_filter = ("category", "is_read")


@admin.register(AuditLogEntry)
class AuditLogEntryAdmin(admin.ModelAdmin):
    list_display = ("action", "actor", "created_at")
    list_filter = ("action",)


@admin.register(ApprovalRequest)
class ApprovalRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "requester", "approver", "status", "requested_at")
    list_filter = ("status",)
