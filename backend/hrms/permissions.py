"""
No custom Role/Permission model exists yet (that's Administration > User
Management, not built — see docs/MODULE_PLAN.md). "HR/admin" capability is
gated on Django's built-in `is_staff` flag until a real role system
exists; swap these to check a role instead of is_staff when that lands,
without touching the views that use them.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsProfileOwnerOrStaff(BasePermission):
    """For EmployeeProfile and its nested resources (obj.profile.user or obj.user)."""

    def has_object_permission(self, request, view, obj):
        owner = getattr(obj, "user", None) or getattr(obj.profile, "user", None)
        return request.user.is_staff or owner == request.user


class IsSelfOrManagerOrStaff(BasePermission):
    """For attendance/leave records (obj.employee): the employee themself, their manager, or staff. Read-only for the manager unless overridden."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or obj.employee == request.user:
            return True
        if obj.employee.manager_id == request.user.id:
            return request.method in SAFE_METHODS
        return False


class IsApproverOrStaff(BasePermission):
    """For approve/reject actions: only the approval's designated approver, or staff."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
