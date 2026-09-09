from django.urls import include, path
from rest_framework.routers import DefaultRouter

from hrms.views import (
    AttendanceCorrectionViewSet,
    AttendanceRecordViewSet,
    BankAccountMeView,
    CheckInView,
    CheckOutView,
    DepartmentViewSet,
    DesignationViewSet,
    EmergencyContactViewSet,
    EmployeeProfileDetailView,
    EmployeeProfileMeView,
    EmployeeSkillViewSet,
    EmployeeViewSet,
    HrmsOverviewView,
    LeaveApprovalsView,
    LeaveBalanceViewSet,
    LeaveRequestViewSet,
    LeaveTypeViewSet,
    OrgStructureView,
    ProfileDocumentViewSet,
    QualificationViewSet,
    SkillCatalogViewSet,
    TeamViewSet,
)

app_name = "hrms"

router = DefaultRouter()
router.register("emergency-contacts", EmergencyContactViewSet, basename="emergency-contact")
router.register("skills", EmployeeSkillViewSet, basename="employee-skill")
router.register("skill-catalog", SkillCatalogViewSet, basename="skill-catalog")
router.register("qualifications", QualificationViewSet, basename="qualification")
router.register("documents", ProfileDocumentViewSet, basename="profile-document")
router.register("designations", DesignationViewSet, basename="designation")
router.register("employees", EmployeeViewSet, basename="employee")
router.register("departments", DepartmentViewSet, basename="department")
router.register("teams", TeamViewSet, basename="team")
router.register("attendance/records", AttendanceRecordViewSet, basename="attendance-record")
router.register("attendance/corrections", AttendanceCorrectionViewSet, basename="attendance-correction")
router.register("leave/types", LeaveTypeViewSet, basename="leave-type")
router.register("leave/balances", LeaveBalanceViewSet, basename="leave-balance")
router.register("leave/requests", LeaveRequestViewSet, basename="leave-request")

urlpatterns = [
    path("profile/me/", EmployeeProfileMeView.as_view(), name="profile-me"),
    path("profile/<int:user_id>/", EmployeeProfileDetailView.as_view(), name="profile-detail"),
    path("bank-account/me/", BankAccountMeView.as_view(), name="bank-account-me"),
    path("org-structure/", OrgStructureView.as_view(), name="org-structure"),
    path("overview/", HrmsOverviewView.as_view(), name="overview"),
    path("attendance/check-in/", CheckInView.as_view(), name="attendance-check-in"),
    path("attendance/check-out/", CheckOutView.as_view(), name="attendance-check-out"),
    path("leave/approvals/pending-count/", LeaveApprovalsView.as_view(), name="leave-approvals-pending-count"),
    path("", include(router.urls)),
]
