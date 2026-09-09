from hrms.views.attendance import (
    AttendanceCorrectionViewSet,
    AttendanceRecordViewSet,
    CheckInView,
    CheckOutView,
)
from hrms.views.employees import DepartmentViewSet, EmployeeViewSet, OrgStructureView, TeamViewSet
from hrms.views.leave import LeaveApprovalsView, LeaveBalanceViewSet, LeaveRequestViewSet, LeaveTypeViewSet
from hrms.views.overview import HrmsOverviewView
from hrms.views.profile import (
    BankAccountMeView,
    DesignationViewSet,
    EmergencyContactViewSet,
    EmployeeProfileDetailView,
    EmployeeProfileMeView,
    EmployeeSkillViewSet,
    ProfileDocumentViewSet,
    QualificationViewSet,
    SkillCatalogViewSet,
)

__all__ = [
    "AttendanceCorrectionViewSet",
    "AttendanceRecordViewSet",
    "CheckInView",
    "CheckOutView",
    "DepartmentViewSet",
    "EmployeeViewSet",
    "OrgStructureView",
    "TeamViewSet",
    "LeaveApprovalsView",
    "LeaveBalanceViewSet",
    "LeaveRequestViewSet",
    "LeaveTypeViewSet",
    "HrmsOverviewView",
    "BankAccountMeView",
    "DesignationViewSet",
    "EmergencyContactViewSet",
    "EmployeeProfileDetailView",
    "EmployeeProfileMeView",
    "EmployeeSkillViewSet",
    "ProfileDocumentViewSet",
    "QualificationViewSet",
    "SkillCatalogViewSet",
]
