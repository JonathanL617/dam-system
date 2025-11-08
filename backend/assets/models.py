from django.db import models

class User(models.Model):
    ROLE_CHOICES = (
        ('admin', 'admin'),
        ('editor', 'editor'),
        ('viewer', 'viewer'),
    )
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    password_hash = models.TextField()
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='viewer')
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'users'
