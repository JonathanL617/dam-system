"""
URL configuration for dam_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

# dam_backend/urls.py
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
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
