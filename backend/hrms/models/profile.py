from django.conf import settings
from django.db import models

from hrms.models.catalog import Designation, Skill


class Gender(models.TextChoices):
    MALE = "male", "Male"
    FEMALE = "female", "Female"
    OTHER = "other", "Other"
    UNDISCLOSED = "undisclosed", "Prefer not to say"


class MaritalStatus(models.TextChoices):
    SINGLE = "single", "Single"
    MARRIED = "married", "Married"
    OTHER = "other", "Other"
    UNDISCLOSED = "undisclosed", "Prefer not to say"


class EmploymentType(models.TextChoices):
    FULL_TIME = "full_time", "Full-time"
    PART_TIME = "part_time", "Part-time"
    CONTRACT = "contract", "Contract"
    INTERN = "intern", "Intern"


class EmployeeProfile(models.Model):
    """
    The rich "My Profile" data core.User deliberately doesn't carry — see
    docs/ARCHITECTURE.md. One row per core.User, created lazily (get-or-
    create) the first time a profile endpoint is hit for that user rather
    than via a signal, so a user with no profile yet doesn't 500.
    """

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="hrms_profile")

    # Personal information
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=Gender.choices, blank=True)
    marital_status = models.CharField(max_length=20, choices=MaritalStatus.choices, blank=True)
    nationality = models.CharField(max_length=100, blank=True)
    blood_group = models.CharField(max_length=5, blank=True)

    # Contact information
    personal_email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=30, blank=True)
    alternate_phone_number = models.CharField(max_length=30, blank=True)
    current_address = models.TextField(blank=True)
    permanent_address = models.TextField(blank=True)

    # Employment details (beyond what's already on core.User)
    designation = models.ForeignKey(
        Designation, on_delete=models.SET_NULL, null=True, blank=True, related_name="employees"
    )
    employment_type = models.CharField(max_length=20, choices=EmploymentType.choices, blank=True)
    work_location = models.CharField(max_length=150, blank=True)
    confirmation_date = models.DateField(null=True, blank=True, help_text="Date probation was confirmed, if applicable")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Profile: {self.user}"


class EmergencyContact(models.Model):
    profile = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name="emergency_contacts")
    name = models.CharField(max_length=150)
    relationship = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=30)
    alternate_phone_number = models.CharField(max_length=30, blank=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ["-is_primary", "name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.relationship})"


class BankAccountType(models.TextChoices):
    SAVINGS = "savings", "Savings"
    CURRENT = "current", "Current"


class BankAccount(models.Model):
    """
    Bank/Payment Information — India-specific fields per the current
    scope (account number + IFSC), one primary account per employee.
    """

    profile = models.OneToOneField(EmployeeProfile, on_delete=models.CASCADE, related_name="bank_account")
    account_holder_name = models.CharField(max_length=150)
    bank_name = models.CharField(max_length=150)
    branch_name = models.CharField(max_length=150, blank=True)
    account_number = models.CharField(max_length=34)
    ifsc_code = models.CharField(max_length=11)
    account_type = models.CharField(max_length=10, choices=BankAccountType.choices, default=BankAccountType.SAVINGS)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Bank account for {self.profile.user}"


class ProficiencyLevel(models.TextChoices):
    BEGINNER = "beginner", "Beginner"
    INTERMEDIATE = "intermediate", "Intermediate"
    ADVANCED = "advanced", "Advanced"
    EXPERT = "expert", "Expert"


class EmployeeSkill(models.Model):
    profile = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name="skills")
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="employee_skills")
    proficiency = models.CharField(max_length=20, choices=ProficiencyLevel.choices, default=ProficiencyLevel.INTERMEDIATE)
    years_of_experience = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)

    class Meta:
        unique_together = ("profile", "skill")
        ordering = ["skill__name"]

    def __str__(self) -> str:
        return f"{self.skill} ({self.profile.user})"


class Qualification(models.Model):
    """Educational qualifications — the "& Qualifications" half of My Profile's Skills & Qualifications section."""

    profile = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name="qualifications")
    title = models.CharField(max_length=200, help_text='e.g. "B.Sc. Computer Science"')
    institution = models.CharField(max_length=200, blank=True)
    year_completed = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["-year_completed"]

    def __str__(self) -> str:
        return self.title


class DocumentType(models.TextChoices):
    ID_PROOF = "id_proof", "ID Proof"
    RESUME = "resume", "Resume"
    OFFER_LETTER = "offer_letter", "Offer Letter"
    CERTIFICATE = "certificate", "Certificate"
    OTHER = "other", "Other"


class ProfileDocument(models.Model):
    """
    Profile-scoped documents only (ID proof, resume, certificates). The
    broader Documents module (company docs, policies, contracts,
    expiry/approval workflow) is explicitly out of scope this session —
    see docs/MODULE_PLAN.md.
    """

    profile = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name="documents")
    document_type = models.CharField(max_length=20, choices=DocumentType.choices, default=DocumentType.OTHER)
    file = models.FileField(upload_to="profile_documents/%Y/%m/")
    original_filename = models.CharField(max_length=255)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self) -> str:
        return self.original_filename
