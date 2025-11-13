# assets/api_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from assets.models import User
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

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
            password_hash=make_password('Admin123'),
            role='admin'
        )
        print("✅ Initial admin created: username='admin', password='Admin123'")



# -----------------------------
# REGISTER
# -----------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return Response({'success': False, 'error': 'All fields are required.'}, status=400)

    try:
        validate_email(email)
    except ValidationError:
        return Response({'success': False, 'error': 'Invalid email format.'}, status=400)

    if len(password) < 8:
        return Response({'success': False, 'error': 'Password must be at least 8 characters.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'success': False, 'error': 'Username already exists.'}, status=400)
    if User.objects.filter(email=email).exists():
        return Response({'success': False, 'error': 'Email already registered.'}, status=400)

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
@permission_classes([AllowAny])
def login_user(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=400)

    try:
        from assets.models import AuthToken
        
        # Try to find user by username or email
        user = User.objects.filter(username=username).first() or User.objects.filter(email=username).first()
        
        if not user:
            return Response({'error': 'Invalid credentials'}, status=400)
            
        if not check_password(password, user.password_hash):
            return Response({'error': 'Invalid credentials'}, status=400)
        
        # Update last login
        user.last_login = timezone.now()
        user.save()

        # Get or create token
        token = AuthToken.objects.filter(user=user).first()
        if not token:
            token = AuthToken.objects.create(
                key=AuthToken.generate_key(),
                user=user
            )
        
        return Response({
            'token': token.key,
            'username': user.username,
            'email': user.email,
            'role': user.role
        })
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': 'Server error'}, status=500)

# -----------------------------
# ADMIN: LIST USERS
# -----------------------------
@api_view(['GET'])
@permission_classes([IsCustomAdmin])
def list_users(request):
    users = User.objects.all().values('id', 'username', 'email', 'role', 'last_login', 'created_at', 'is_active')
    return Response(list(users))

# -----------------------------
# ADMIN: EDIT ROLE / RESET PASSWORD / DELETE USER
# -----------------------------
@api_view(['PUT', 'DELETE'])
@permission_classes([IsCustomAdmin])
def user_detail(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)

    if request.method == 'PUT':
        role = request.data.get('role')
        password = request.data.get('password')

        if role in ['admin', 'editor', 'viewer']:
            user.role = role
        if password and len(password) >= 8:
            user.password_hash = make_password(password)
        user.save()
        return Response({'success': True, 'message': 'User updated successfully.'})

    if request.method == 'DELETE':
        if user.role == 'admin':
            return Response({'error': 'Cannot delete admin account.'}, status=400)
        user.delete()
        return Response({'message': 'User deleted successfully.'})

# -----------------------------
# USER DASHBOARD / PROFILE
# -----------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    # Get user from token
    try:
        token_key = request.headers.get('Authorization', '').replace('Token ', '')
        token = Token.objects.get(key=token_key)
        user = User.objects.get(id=token.user_id)
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'is_active': user.is_active,
            'last_login': user.last_login
        })
    except (Token.DoesNotExist, User.DoesNotExist):
        return Response({'error': 'Invalid token'}, status=401)