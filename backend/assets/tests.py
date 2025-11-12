from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth.hashers import make_password
from .models import User

class UserAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test viewer user
        self.user = User.objects.create(
            username='testuser',
            email='test@example.com',
            password_hash=make_password('password123'),
            role='viewer'
        )

        # Create a test admin user
        self.admin = User.objects.create(
            username='testadmin',
            email='testadmin@example.com',
            password_hash=make_password('Admin123!'),
            role='admin'
        )

    # -----------------------------
    # REGISTER USER
    # -----------------------------
    def test_register_user(self):
        url = reverse('api_register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'NewUser123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertIn('user_id', response.data)

        # Test invalid email
        data['email'] = 'bademail'
        response = self.client.post(url, data, format='json')
        self.assertFalse(response.data['success'])

        # Test short password
        data['email'] = 'validemail@example.com'
        data['password'] = 'short'
        response = self.client.post(url, data, format='json')
        self.assertFalse(response.data['success'])

    # -----------------------------
    # LOGIN USER
    # -----------------------------
    def test_login_user(self):
        url = reverse('api_login')
        data = {'username': 'testuser', 'password': 'password123'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['role'], 'viewer')
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

        # Test invalid password
        data['password'] = 'wrongpass'
        response = self.client.post(url, data, format='json')
        self.assertFalse(response.data['success'])

        # Test non-existing user
        data['username'] = 'nouser'
        response = self.client.post(url, data, format='json')
        self.assertFalse(response.data['success'])

    # -----------------------------
    # ADMIN EDIT USER ROLE
    # -----------------------------
    def test_admin_edit_user_role(self):
        url = reverse('api_user_detail', args=[self.user.id])
        self.client.force_authenticate(user=self.admin)
        data = {'role': 'editor'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, 'editor')

    # -----------------------------
    # ADMIN RESET USER PASSWORD
    # -----------------------------
    def test_admin_reset_user_password(self):
        url = reverse('api_user_detail', args=[self.user.id])
        self.client.force_authenticate(user=self.admin)
        data = {'password': 'NewPass123'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])

        # Confirm login works with new password
        login_url = reverse('api_login')
        login_data = {'username': self.user.username, 'password': 'NewPass123'}
        login_response = self.client.post(login_url, login_data, format='json')
        self.assertTrue(login_response.data['success'])

    # -----------------------------
    # ADMIN DELETE USER
    # -----------------------------
    def test_admin_delete_user(self):
        url = reverse('api_user_detail', args=[self.user.id])
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertFalse(User.objects.filter(id=self.user.id).exists())

        # Attempt to delete admin account
        url_admin = reverse('api_user_detail', args=[self.admin.id])
        response = self.client.delete(url_admin)
        self.assertFalse(response.data['success'])
