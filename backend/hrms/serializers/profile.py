from rest_framework import serializers

from hrms.models import (
    BankAccount,
    Designation,
    EmergencyContact,
    EmployeeProfile,
    EmployeeSkill,
    ProfileDocument,
    Qualification,
    Skill,
)


class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designation
        fields = ["id", "name", "code", "level"]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ["id", "name", "relationship", "phone_number", "alternate_phone_number", "is_primary"]


class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = [
            "account_holder_name",
            "bank_name",
            "branch_name",
            "account_number",
            "ifsc_code",
            "account_type",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]


class EmployeeSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name", read_only=True)
    skill = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all())
    # Lets the frontend create-or-attach a skill by name in one call instead of a separate lookup round trip.
    skill_name_input = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = EmployeeSkill
        fields = ["id", "skill", "skill_name", "skill_name_input", "proficiency", "years_of_experience"]
        extra_kwargs = {"skill": {"required": False}}

    def validate(self, attrs):
        if not attrs.get("skill") and not attrs.get("skill_name_input"):
            raise serializers.ValidationError("Provide either skill or skill_name_input.")
        return attrs

    def create(self, validated_data):
        skill_name_input = validated_data.pop("skill_name_input", None)
        if skill_name_input and not validated_data.get("skill"):
            skill = Skill.objects.filter(name__iexact=skill_name_input).first()
            if skill is None:
                skill = Skill.objects.create(name=skill_name_input)
            validated_data["skill"] = skill
        return super().create(validated_data)


class QualificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Qualification
        fields = ["id", "title", "institution", "year_completed"]


class ProfileDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source="uploaded_by.get_full_name", read_only=True)

    class Meta:
        model = ProfileDocument
        fields = ["id", "document_type", "file", "original_filename", "uploaded_by_name", "uploaded_at"]
        read_only_fields = ["uploaded_at"]


class EmployeeProfileSerializer(serializers.ModelSerializer):
    """Full profile: scalar fields writable here, nested collections are read-only pointers to their own endpoints."""

    designation_name = serializers.CharField(source="designation.name", read_only=True)
    emergency_contacts = EmergencyContactSerializer(many=True, read_only=True)
    bank_account = BankAccountSerializer(read_only=True)
    skills = EmployeeSkillSerializer(many=True, read_only=True)
    qualifications = QualificationSerializer(many=True, read_only=True)
    documents = ProfileDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = EmployeeProfile
        fields = [
            "id",
            "date_of_birth",
            "gender",
            "marital_status",
            "nationality",
            "blood_group",
            "personal_email",
            "phone_number",
            "alternate_phone_number",
            "current_address",
            "permanent_address",
            "designation",
            "designation_name",
            "employment_type",
            "work_location",
            "confirmation_date",
            "emergency_contacts",
            "bank_account",
            "skills",
            "qualifications",
            "documents",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]
