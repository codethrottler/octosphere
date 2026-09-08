from django.db import models


class Company(models.Model):
    """Top of the org hierarchy: Company -> Branch -> Department -> Team -> Employees."""

    name = models.CharField(max_length=255)
    code = models.SlugField(max_length=32, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "companies"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Branch(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="branches")
    name = models.CharField(max_length=255)
    code = models.SlugField(max_length=32)
    city = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("company", "code")
        ordering = ["company__name", "name"]

    def __str__(self) -> str:
        return f"{self.company.name} / {self.name}"


class Department(models.Model):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="departments")
    name = models.CharField(max_length=255)
    code = models.SlugField(max_length=32)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("branch", "code")
        ordering = ["branch__name", "name"]

    def __str__(self) -> str:
        return self.name


class Team(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="teams")
    name = models.CharField(max_length=255)
    code = models.SlugField(max_length=32)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("department", "code")
        ordering = ["department__name", "name"]

    def __str__(self) -> str:
        return self.name
