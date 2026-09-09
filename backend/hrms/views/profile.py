from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import User
from hrms.models import BankAccount, Designation, EmergencyContact, EmployeeProfile, EmployeeSkill, ProfileDocument, Qualification, Skill
from hrms.permissions import IsProfileOwnerOrStaff
from hrms.serializers import (
    BankAccountSerializer,
    DesignationSerializer,
    EmergencyContactSerializer,
    EmployeeProfileSerializer,
    EmployeeSkillSerializer,
    ProfileDocumentSerializer,
    QualificationSerializer,
    SkillSerializer,
)


def get_or_create_profile(user: User) -> EmployeeProfile:
    """
    Lazily create the profile row on first access instead of a post_save
    signal on User — most users won't touch My Profile immediately, and a
    signal would mean every test/fixture user creation pays the cost.
    """
    profile, _ = EmployeeProfile.objects.get_or_create(user=user)
    return profile


class EmployeeProfileMeView(APIView):
    """GET/PATCH /api/hrms/profile/me/ — the authenticated user's own profile."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_or_create_profile(request.user)
        return Response(EmployeeProfileSerializer(profile).data)

    def patch(self, request):
        profile = get_or_create_profile(request.user)
        serializer = EmployeeProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class EmployeeProfileDetailView(APIView):
    """GET /api/hrms/profile/<user_id>/ — staff-only read of another employee's profile."""

    permission_classes = [IsAdminUser]

    def get(self, request, user_id: int):
        user = get_object_or_404(User, pk=user_id)
        profile = get_or_create_profile(user)
        return Response(EmployeeProfileSerializer(profile).data)


class BankAccountMeView(APIView):
    """GET/PUT /api/hrms/bank-account/me/ — one row, upserted (BankAccount is OneToOne on EmployeeProfile)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_or_create_profile(request.user)
        account = getattr(profile, "bank_account", None)
        if account is None:
            return Response(None)
        return Response(BankAccountSerializer(account).data)

    def put(self, request):
        profile = get_or_create_profile(request.user)
        account = getattr(profile, "bank_account", None)
        serializer = BankAccountSerializer(account, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(profile=profile)
        return Response(serializer.data)


class ProfileScopedViewSet(viewsets.ModelViewSet):
    """
    Shared base for the 4 "list of things on my profile" resources
    (emergency contacts, skills, qualifications, documents): always
    scoped to the requesting user's own profile — see
    docs/ARCHITECTURE.md, My Profile is self-service this session.
    """

    permission_classes = [IsAuthenticated, IsProfileOwnerOrStaff]

    def get_queryset(self):
        profile = get_or_create_profile(self.request.user)
        return self.queryset.filter(profile=profile)

    def perform_create(self, serializer):
        serializer.save(profile=get_or_create_profile(self.request.user))


class EmergencyContactViewSet(ProfileScopedViewSet):
    queryset = EmergencyContact.objects.all()
    serializer_class = EmergencyContactSerializer


class EmployeeSkillViewSet(ProfileScopedViewSet):
    queryset = EmployeeSkill.objects.select_related("skill").all()
    serializer_class = EmployeeSkillSerializer


class QualificationViewSet(ProfileScopedViewSet):
    queryset = Qualification.objects.all()
    serializer_class = QualificationSerializer


class ProfileDocumentViewSet(ProfileScopedViewSet):
    queryset = ProfileDocument.objects.all()
    serializer_class = ProfileDocumentSerializer
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(profile=get_or_create_profile(self.request.user), uploaded_by=self.request.user)


class DesignationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer
    permission_classes = [IsAuthenticated]


class SkillCatalogViewSet(viewsets.ReadOnlyModelViewSet):
    """List of the Skill catalog, for a typeahead when adding a skill to a profile."""

    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
