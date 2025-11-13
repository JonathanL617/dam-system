from django.urls import path
from . import api_views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('api/register/', api_views.register_user, name='api_register'),
    path('api/login/', api_views.login_user, name='api_login'),
    path('api/users/', api_views.list_users, name='api_users'),  # admin only
    path('api/users/<int:user_id>/', api_views.user_detail, name='api_user_detail'),  # edit/delete/reset
    path('api/dashboard/', api_views.user_dashboard, name='api_dashboard'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

