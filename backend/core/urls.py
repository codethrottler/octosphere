from django.urls import path

from core.views import CurrentUserView, HealthCheckView

app_name = "core"

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health"),
    path("me/", CurrentUserView.as_view(), name="me"),
]
