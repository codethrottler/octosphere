from django.db import connection
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

import django


class HealthCheckView(APIView):
    """
    GET /api/core/health/ — proves Django + MySQL + (by being reachable at
    all) the frontend's dev proxy are wired end to end. Public on purpose:
    a health check gated behind auth can't tell you auth is broken.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        db_ok = True
        db_error = None
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except Exception as exc:  # pragma: no cover - defensive, exercised manually
            db_ok = False
            db_error = str(exc)

        return Response(
            {
                "status": "ok" if db_ok else "degraded",
                "django_version": django.get_version(),
                "database": {
                    "engine": connection.settings_dict["ENGINE"],
                    "name": connection.settings_dict["NAME"],
                    "connected": db_ok,
                    "error": db_error,
                },
            }
        )
