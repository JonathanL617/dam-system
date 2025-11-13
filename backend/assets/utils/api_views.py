from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, IsAuthenticated
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from ..models import User
from rest_framework.authtoken.models import Token
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db.models import Q

# -----------------------------
# Custom Admin Permission
# -----------------------------
class IsCustomAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and hasattr(request.user, 'role') and request.user.role == 'admin'

# -----------------------------
# CREATE INITIAL ADMIN (run once)
# -----------------------------
def create_initial_admin():
    if not User.objects.filter(role='admin').exists():
        User.objects.create(
            username='admin',
            email='admin@example.com',
            password_hash=make_password('Admin123'),  # hash it
            role='admin'
        )
        print("Initial admin created: username='admin', password='Admin123'")

# -----------------------------
# REGISTER
# -----------------------------
@api_view(['POST'])
def register_user(request):
    data = request.data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return Response({'success': False, 'error': 'All fields are required.'})

    try:
        validate_email(email)
    except ValidationError:
        return Response({'success': False, 'error': 'Invalid email format.'})

    if len(password) < 8:
        return Response({'success': False, 'error': 'Password must be at least 8 characters.'})

    if User.objects.filter(username=username).exists():
        return Response({'success': False, 'error': 'Username already exists.'})
    if User.objects.filter(email=email).exists():
        return Response({'success': False, 'error': 'Email already registered.'})

    user = User.objects.create(
        username=username,
        email=email,
        password_hash=make_password(password),
        role='viewer'
    )

    return Response({'success': True, 'message': 'User registered successfully.', 'user_id': user.id})

# -----------------------------
# LOGIN
# -----------------------------
@api_view(['POST'])
def login_user(request):
    data = request.data
    identifier = data.get('identifier')
    password = data.get('password')

    if not identifier or not password:
        return Response({'success': False, 'error': 'Username and password required'}, status=400)
    
    try:
        user = User.objects.get(Q(username = identifier) | Q(email = identifier))

        if check_password(password, user.password_hash):
            # Update last login
            user.last_login = timezone.now()
            user.save()

            # Create or get DRF token
            token, created = Token.objects.get_or_create(user=user)

            return Response({
                'success': True,
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'token': token.key  # ← DRF Token
            })
        else:
            return Response({'success': False, 'error': 'Invalid password'}, status=400)
    except User.DoesNotExist:
        return Response({'success': False, 'error': 'User not found'}, status=400)

# -----------------------------
# ADMIN: LIST USERS
# -----------------------------
@api_view(['GET'])
@permission_classes([IsCustomAdmin])
def list_users(request):
    users = User.objects.all().values('id', 'username', 'email', 'role', 'last_login', 'created_at')
    return Response({'success': True, 'users': list(users)})

# -----------------------------
# ADMIN: EDIT ROLE / RESET PASSWORD / DELETE USER
# -----------------------------
@api_view(['PUT', 'DELETE'])
@permission_classes([IsCustomAdmin])
def user_detail(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'success': False, 'error': 'User not found.'})

    if request.method == 'PUT':
        role = request.data.get('role')
        password = request.data.get('password')

        if role in ['editor', 'viewer']:
            user.role = role
        if password and len(password) >= 8:
            user.password_hash = make_password(password)
        user.save()
        return Response({'success': True, 'message': 'User updated successfully.'})

    if request.method == 'DELETE':
        if user.role == 'admin':
            return Response({'success': False, 'error': 'Cannot delete admin account.'})
        user.delete()
        return Response({'success': True, 'message': 'User deleted successfully.'})

# -----------------------------
# USER DASHBOARD
# -----------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    user = request.user
    return Response({
        'success': True,
        'user_id': user.id,
        'username': user.username,
        'role': user.role
    })
