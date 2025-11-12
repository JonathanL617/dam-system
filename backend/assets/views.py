from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.http import HttpResponse
from .models import User
from django.contrib.auth.hashers import make_password
from django.contrib import messages
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404, redirect
import re
# -----------------------------
# LOGIN
# -----------------------------
def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        try:
            user = User.objects.get(username=username)
            if check_password(password, user.password_hash):
                request.session['user_id'] = user.id
                request.session['role'] = user.role
                user.last_login = timezone.now()
                user.save()

                if user.role == 'admin':
                    return redirect('admin_dashboard')
                else:
                    return redirect('user_dashboard')
            else:
                return render(request, 'login.html', {'error': 'Invalid password'})
        except User.DoesNotExist:
            return render(request, 'login.html', {'error': 'User not found'})

    return render(request, 'login.html')


# -----------------------------
# REGISTER (default viewer)
# -----------------------------
def register_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Check for missing fields
        if not username or not email or not password:
            return render(request, 'register.html', {'error': 'All fields are required.'})

        # email format check using Django validator
        try:
            validate_email(email)
        except ValidationError:
            messages.error(request, "Invalid email format.")
            return render(request, 'register.html')

        # Check password length
        if len(password) < 8:
            return render(request, 'register.html', {'error': 'Password must be at least 8 characters long.'})

        # Check for duplicates
        if User.objects.filter(username=username).exists():
            return render(request, 'register.html', {'error': 'Username already exists.'})
        if User.objects.filter(email=email).exists():
            return render(request, 'register.html', {'error': 'Email already registered.'})

        # Create new user (default role = viewer)
        User.objects.create(
            username=username,
            email=email,
            password_hash=make_password(password),
            role='viewer'
        )
        messages.success(request, "Account created successfully. You can now log in.")
        return redirect('login')

    return render(request, 'register.html')

# -----------------------------
# LOGOUT
# -----------------------------
def logout_view(request):
    request.session.flush()
    return redirect('login')


# -----------------------------
# ADMIN DASHBOARD (manage users)
# -----------------------------
def admin_dashboard(request):
    if request.session.get('role') != 'admin':
        return HttpResponse("Access denied")

    users = User.objects.all()
    return render(request, 'admin_dashboard.html', {'users': users})


# -----------------------------
# EDIT USER ROLE
# -----------------------------
def edit_user_role(request, user_id):
    if request.session.get('role') != 'admin':
        return HttpResponse("Access denied")

    user = get_object_or_404(User, id=user_id)

    # Prevent changing the role of an admin account
    if user.role == 'admin':
        return HttpResponse("Cannot change role of admin account!")

    if request.method == 'POST':
        new_role = request.POST.get('role')
        if new_role in ['editor', 'viewer']:
            user.role = new_role
            user.save()
        return redirect('admin_dashboard')

    return render(request, 'edit_user.html', {'user': user})


# -----------------------------
# DELETE USER
# -----------------------------

from django.shortcuts import get_object_or_404, redirect
from django.contrib import messages
from .models import User

def delete_user(request, user_id):
    # Only admin can delete
    if request.session.get('role') != 'admin':
        messages.error(request, "Access denied.")
        return redirect('admin_dashboard')

    user = get_object_or_404(User, id=user_id)

    # Prevent deleting an admin account
    if user.role == 'admin':
        messages.error(request, "Cannot delete admin account!")
        return redirect('admin_dashboard')

    # Delete the user
    user.delete()
    messages.success(request, f"User '{user.username}' deleted successfully.")

# -----------------------------
# USER DASHBOARD (shared by editor + viewer)
# -----------------------------
def user_dashboard(request):
    role = request.session.get('role')
    if role not in ['editor', 'viewer']:
        return HttpResponse("Access denied")

    return render(request, 'user_dashboard.html', {'role': role})


# -----------------------------
# ADMIN RESET PASSWORD
# -----------------------------
def reset_user_password(request, user_id):
    # Only allow admin to access
    if request.session.get('role') != 'admin':
        return HttpResponse("Access denied")

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return HttpResponse("User not found")

    if request.method == 'POST':
        new_password = request.POST.get('new_password')
        if not new_password:
            messages.error(request, "Please enter a new password.")
        elif len(new_password) < 8:
            messages.error(request, "Password must be at least 8 characters long.")
        else:
            user.password_hash = make_password(new_password)
            user.save()
            messages.success(request, f"Password reset for {user.username}")
            return redirect('admin_dashboard')

    return render(request, 'reset_password.html', {'user': user})