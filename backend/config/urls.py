"""
OctoSphere URL configuration.

API URL structure (see docs/CONVENTIONS.md): /api/<app>/<resource>/, no
version prefix yet — this is a monorepo with one frontend consumer, so
there's nothing to version against until a second consumer exists. Add
/api/v2/ alongside /api/ if/when a breaking change needs one, rather than
pre-versioning speculatively.
"""

from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/core/", include("core.urls")),
    path("api/hrms/", include("hrms.urls")),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
