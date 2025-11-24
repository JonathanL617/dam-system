# assets/api_views.py
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, AllowAny
from rest_framework.authentication import BaseAuthentication
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from assets.models import User, AuthToken, Asset, AssetGroup
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from rest_framework import exceptions

from PIL import Image
import cv2
import os
from django.conf import settings

# -----------------------------
# Custom Admin Permission
# -----------------------------
class IsCustomAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and hasattr(request.user, 'role') and request.user.role == 'admin'

class IsEditorOrAdmin(BasePermission):
    """Permission class that allows both editors and admins"""
    def has_permission(self, request, view):
        return request.user and hasattr(request.user, 'role') and request.user.role in ['editor', 'admin']

# -----------------------------
# Custom AuthToken Authentication
# -----------------------------
class AuthTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Token '):
            return None
        token_key = auth_header.replace('Token ', '')
        try:
            token = AuthToken.objects.get(key=token_key)
        except AuthToken.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid token')
        return (token.user, token)

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

    user = User.objects.filter(username=username).first() or User.objects.filter(email=username).first()
    if not user or not check_password(password, user.password_hash):
        return Response({'error': 'Invalid credentials'}, status=400)
    
    if not user.is_active:
        return Response({'error': 'Account is deactivated.'}, status=403)


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

# -----------------------------
# ADMIN: LIST USERS
# -----------------------------
@api_view(['GET'])
@authentication_classes([AuthTokenAuthentication])
@permission_classes([IsCustomAdmin])
def list_users(request):
    users = User.objects.all().values('id', 'username', 'email', 'role', 'last_login', 'created_at', 'is_active')
    return Response(list(users))

# -----------------------------
# ADMIN: EDIT ROLE / RESET PASSWORD / DELETE USER
# -----------------------------
@api_view(['PUT', 'DELETE'])
@authentication_classes([AuthTokenAuthentication])
@permission_classes([IsCustomAdmin])
def user_detail(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)

    if request.method == 'PUT':
    
        if user.role == 'admin':
             return Response({'error': 'Cannot edit admin account.'}, status=400)

        role = request.data.get('role')
        password = request.data.get('password')
        is_active = request.data.get('is_active')

        if role in ['admin', 'editor', 'viewer']:
            user.role = role
        if password and len(password) >= 8:
            user.password_hash = make_password(password)
        if is_active is not None:
            # Accept both boolean and string values
            if isinstance(is_active, bool):
                user.is_active = is_active
            elif isinstance(is_active, str):
                user.is_active = is_active.lower() == 'true'
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
@authentication_classes([AuthTokenAuthentication])
def user_dashboard(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'is_active': user.is_active,
        'last_login': user.last_login
    })

# -----------------------------
# ASSETS: LIST
# -----------------------------
@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def list_assets(request):
    if request.method == 'POST':
        return create_asset_group(request)

    # Simple implementation: return all active assets
    assets = Asset.objects.filter(is_active=True).select_related('asset_group')
    
    results = []
    for asset in assets:
        results.append({
            'id': asset.id,
            'name': asset.asset_group.name,
            'type': asset.asset_group.asset_type,
            'url': asset.web_version_path or asset.file_path,
            'thumbnail': asset.thumbnail_path,
            'tags': [{'tag': t.tag} for t in asset.asset_group.tags.all()],
            'uploaded_at': asset.uploaded_at,
            'file_size': asset.get_file_size_display()
        })
    
    return Response({'results': results})

@api_view(['POST'])
@authentication_classes([AuthTokenAuthentication])
@permission_classes([IsCustomAdmin]) # Only editors can upload
def create_asset_group(request):
    name = request.data.get('name')
    asset_type = request.data.get('asset_type')
    
    if not name or not asset_type:
        return Response({'error': 'Name and asset_type are required'}, status=400)
        
    # Check if exists
    if AssetGroup.objects.filter(name=name).exists():
         return Response({'error': 'Asset with this name already exists'}, status=400)
         
    group = AssetGroup.objects.create(
        name=name,
        asset_type=asset_type,
        created_by=request.user.username
    )
    
    return Response({'id': group.id, 'name': group.name})

@api_view(['POST'])
@authentication_classes([AuthTokenAuthentication])
@permission_classes([IsCustomAdmin])
def upload_asset_version(request, group_id):
    try:
        group = AssetGroup.objects.get(id=group_id)
    except AssetGroup.DoesNotExist:
        return Response({'error': 'Asset group not found'}, status=404)
        
    file = request.FILES.get('file')
    change_notes = request.data.get('change_notes', '')
    
    if not file:
        return Response({'error': 'No file provided'}, status=400)
        
    # Determine version number
    last_version = group.get_latest_version()
    new_version_num = (last_version.version_number + 1) if last_version else 1
    
    # Save file (simple save, in real app use S3 or similar)
    # For this demo we just save to media root
    import os
    from django.conf import settings
    from django.core.files.storage import default_storage
    from django.core.files.base import ContentFile
    
    file_ext = os.path.splitext(file.name)[1]
    filename = f"{group.name}_v{new_version_num}{file_ext}"
    path = default_storage.save(f"assets/{filename}", ContentFile(file.read()))
    
    # Create Asset Version
    asset = Asset.objects.create(
        asset_group=group,
        version_number=new_version_num,
        filename=filename,
        file_path=f"/media/{path}",
        file_size=file.size,
        file_type=file_ext.replace('.', ''),
        uploaded_by=request.user.username,
        change_notes=change_notes
    )
    
    # Update group current version
    group.current_version = asset
    group.save()
    
    # Update group current version
    group.current_version = asset
    group.save()
    
    return Response({'success': True, 'version': asset.version_number})

@api_view(['POST'])
@authentication_classes([AuthTokenAuthentication])
@permission_classes([IsEditorOrAdmin])
def create_and_upload_asset(request):
    name = request.data.get('name')
    file = request.FILES.get('file')
    change_notes = request.data.get('change_notes', 'Initial upload')
    
    if not name or not file:
        return Response({'error': 'Name and file are required'}, status=400)
        
    # Check if exists
    if AssetGroup.objects.filter(name=name).exists():
         return Response({'error': 'Asset with this name already exists'}, status=400)

    # Determine asset_type from mime/extension
    import mimetypes
    import os
    
    mime_type, _ = mimetypes.guess_type(file.name)
    ext = os.path.splitext(file.name)[1].lower()
    
    asset_type = 'image' # default
    if mime_type:
        if mime_type.startswith('video/'):
            asset_type = 'video'
        elif mime_type.startswith('image/'):
            asset_type = 'image'
            
    # Override for 3D models based on extension
    if ext in ['.glb', '.gltf', '.obj', '.fbx']:
        asset_type = '3d'
        
    # Create Group
    group = AssetGroup.objects.create(
        name=name,
        asset_type=asset_type,
        created_by=request.user.username
    )
    
    # Save File & Create Version
    from django.conf import settings
    from django.core.files.storage import default_storage
    from django.core.files.base import ContentFile

    filename = f"{group.name}_v1{ext}"
    path = default_storage.save(f"assets/{filename}", ContentFile(file.read()))

    thumbnail_path = ''
    try:
        if asset_type == 'image':
            # Generate image thumbnail
            img = Image.open(default_storage.path(path))
            # Convert RGBA to RGB for JPEG compatibility
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            img.thumbnail((400, 400))
            thumb_filename = f"{group.name}_v1_thumb.jpg"
            thumb_path = f"assets/thumbnails/{thumb_filename}"
            os.makedirs(os.path.join(settings.MEDIA_ROOT, 'assets', 'thumbnails'), exist_ok=True)
            img.save(default_storage.path(thumb_path), 'JPEG')
            thumbnail_path = f"/media/{thumb_path}"
        
        elif asset_type == 'video':
            # Generate video thumbnail (first frame)
            video_path = default_storage.path(path)
            vidcap = cv2.VideoCapture(video_path)
            success, image = vidcap.read()
            if success:
                thumb_filename = f"{group.name}_v1_thumb.jpg"
                thumb_path = f"assets/thumbnails/{thumb_filename}"
                os.makedirs(os.path.join(settings.MEDIA_ROOT, 'assets', 'thumbnails'), exist_ok=True)
                cv2.imwrite(default_storage.path(thumb_path), image)
                thumbnail_path = f"/media/{thumb_path}"
            vidcap.release()
    except Exception as e:
        print(f"Failed to generate thumbnail: {e}")
    
    asset = Asset.objects.create(
        asset_group=group,
        version_number=1,
        filename=filename,
        file_path=f"/media/{path}",
        file_size=file.size,
        file_type=ext.replace('.', ''),
        thumbnail_path=thumbnail_path,  # ← Add this line
        uploaded_by=request.user.username,
        change_notes=change_notes
    )
    
    group.current_version = asset
    group.save()
    
    return Response({'success': True, 'id': group.id})

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_asset_detail(request, asset_id):
    """Get details of a single asset"""
    try:
        asset = Asset.objects.select_related('asset_group').get(id=asset_id, is_active=True)
            
        return Response({
                'id': asset.id,
                'name': asset.asset_group.name,
                'type': asset.asset_group.asset_type,
                'url': asset.web_version_path or asset.file_path,
                'thumbnail': asset.thumbnail_path,
                'description': '',
                'tags': [{'tag': t.tag} for t in asset.asset_group.tags.all()],
                'uploaded_at': asset.uploaded_at,
                'created_at': asset.asset_group.created_at,
                'file_size': asset.get_file_size_display(),
                'version_number': asset.version_number,
                'uploaded_by': asset.uploaded_by,
            })
    except Asset.DoesNotExist:
        return Response({'error': 'Asset not found'}, status=404)


# -----------------------------
# ASSETS: DELETE ASSET
# -----------------------------
@api_view(['DELETE'])
@authentication_classes([AuthTokenAuthentication])
@permission_classes([IsEditorOrAdmin])
def delete_asset(request, asset_id):
    try:
        asset = Asset.objects.get(id=asset_id)
    except Asset.DoesNotExist:
        return Response({'error': 'Asset not found'}, status=404)
    
    # Soft delete by setting is_active=False
    asset.is_active = False
    asset.save()
    
    # Or hard delete:
    # asset.delete()
    
    return Response({'success': True, 'message': 'Asset deleted successfully'})

# -----------------------------
# ASSETS: UPDATE ASSET
# -----------------------------
@api_view(['PUT'])
@authentication_classes([AuthTokenAuthentication])
@permission_classes([IsEditorOrAdmin])
def update_asset(request, asset_id):
    try:
        asset = Asset.objects.get(id=asset_id)
    except Asset.DoesNotExist:
        return Response({'error': 'Asset not found'}, status=404)
    
    name = request.data.get('name')
    if name:
        # Update the asset group name
        asset.asset_group.name = name
        asset.asset_group.save()
    
    return Response({'success': True, 'message': 'Asset updated successfully'})