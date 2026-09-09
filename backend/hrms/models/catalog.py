from django.db import models


class Designation(models.Model):
    """
    HR-managed job-title catalog, backing the Employees > Designations
    screen. Separate from core.User.title (a free-text display field
    that predates this and stays untouched) — EmployeeProfile.designation
    is the structured version the UI prefers once set.
    """

    name = models.CharField(max_length=150, unique=True)
    code = models.SlugField(max_length=40, unique=True)
    level = models.PositiveSmallIntegerField(default=0, help_text="Sort/seniority order, lower is more junior")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["level", "name"]

    def __str__(self) -> str:
        return self.name


class Skill(models.Model):
    """Flat skill catalog. Employees attach to it via EmployeeSkill (hrms/models/profile.py)."""

    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
