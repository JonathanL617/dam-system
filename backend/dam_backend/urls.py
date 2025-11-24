"""
URL configuration for dam_backend project.
"""

from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from assets import api_views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth endpoints
    path('api/auth/register/', api_views.register_user, name='register'),
    path('api/auth/login/', api_views.login_user, name='login'),
    path('api/auth/profile/', api_views.user_dashboard, name='profile'),
    
    # Admin endpoints
    path('api/admin/users/', api_views.list_users, name='list_users'),
    path('api/admin/users/<int:user_id>/', api_views.user_detail, name='user_detail'),
    
    # Asset endpoints
    path('api/assets/', api_views.list_assets, name='list_assets'),
    path('api/assets/<int:asset_id>/', api_views.get_asset_detail, name='get_asset_detail'),
    path('api/assets/<int:asset_id>/update/', api_views.update_asset, name='update_asset'),
    path('api/assets/<int:asset_id>/delete/', api_views.delete_asset, name='delete_asset'),
    path('api/assets/<int:asset_id>/tags/', api_views.manage_asset_tags, name='manage_asset_tags'),
    path('api/assets/<int:group_id>/upload-version/', api_views.upload_asset_version, name='upload_asset_version'),
    path('api/assets/upload/', api_views.create_and_upload_asset, name='create_and_upload_asset'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
