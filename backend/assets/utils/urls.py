from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),

    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('edit-user/<int:user_id>/', views.edit_user_role, name='edit_user_role'),
    path('delete-user/<int:user_id>/', views.delete_user, name='delete_user'),

    path('dashboard/', views.user_dashboard, name='user_dashboard'),
    path('reset-password/<int:user_id>/', views.reset_user_password, name='reset_password'),

]
