from django.urls import reverse
from rest_framework.test import APITestCase

from core.models import User


class HealthCheckTests(APITestCase):
    def test_health_check_is_public_and_reports_db_connection(self):
        response = self.client.get(reverse("core:health"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "ok")
        self.assertTrue(response.data["database"]["connected"])


class CurrentUserViewTests(APITestCase):
    def test_me_requires_auth(self):
        response = self.client.get(reverse("core:me"))
        self.assertEqual(response.status_code, 401)

    def test_me_returns_authenticated_user(self):
        user = User.objects.create_user(username="priya", first_name="Priya", last_name="Nair", password="pw")
        self.client.force_authenticate(user)

        response = self.client.get(reverse("core:me"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Priya Nair")
        self.assertEqual(response.data["initials"], "PN")
