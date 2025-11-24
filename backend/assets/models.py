# backend/assets/models.py

from django.db import models
from django.utils import timezone

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


class AssetGroup(models.Model):
    """
    Represents a family of asset versions
    Example: "ProductPhoto_A" has v1, v2, v3
    """
    ASSET_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('3d', '3D Model'),
    ]
    
    name = models.CharField(max_length=255, unique=True, db_index=True)
    asset_type = models.CharField(max_length=10, choices=ASSET_TYPE_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    created_by = models.CharField(max_length=150, blank=True, null=True)
    current_version = models.ForeignKey(
        'Asset',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='current_for_group'
    )
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'asset_groups'
        verbose_name = 'Asset Group'
        verbose_name_plural = 'Asset Groups'
    
    def __str__(self):
        return f"{self.name} ({self.asset_type})"
    
    def get_total_versions(self):
        """Get total number of versions"""
        return self.versions.count()
    
    def get_latest_version(self):
        """Get latest version"""
        return self.versions.order_by('-version_number').first()


class Asset(models.Model):
    """
    Individual version of an asset
    Example: ProductPhoto_A v2
    """
    asset_group = models.ForeignKey(
        AssetGroup,
        on_delete=models.CASCADE,
        related_name='versions'
    )
    version_number = models.IntegerField()
    version_label = models.CharField(max_length=50, blank=True)
    
    # File information
    filename = models.CharField(max_length=255)
    file_path = models.TextField()
    file_size = models.BigIntegerField()  # in bytes
    file_type = models.CharField(max_length=50)
    mime_type = models.CharField(max_length=100, blank=True, null=True)
    
    # Metadata (from MetadataExtractor)
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    duration = models.FloatField(null=True, blank=True)  # For videos in seconds
    metadata_json = models.JSONField(null=True, blank=True)
    
    # Thumbnail/Web versions
    thumbnail_path = models.TextField(blank=True, null=True)  # ← Added null=True
    web_version_path = models.TextField(blank=True)
    
    # Version tracking
    uploaded_at = models.DateTimeField(auto_now_add=True, db_index=True)
    uploaded_by = models.CharField(max_length=150, blank=True, null=True)
    change_notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-version_number']
        db_table = 'assets'
        unique_together = ['asset_group', 'version_number']
        verbose_name = 'Asset Version'
        verbose_name_plural = 'Asset Versions'
        indexes = [
            models.Index(fields=['filename']),
            models.Index(fields=['uploaded_at']),
        ]
    
    def __str__(self):
        return f"{self.asset_group.name} v{self.version_number}"
    
    def get_file_size_display(self):
        """Convert bytes to human readable format"""
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"


class AssetTag(models.Model):
    """
    Tags for asset categorization and search
    """
    asset_group = models.ForeignKey(
        AssetGroup,
        on_delete=models.CASCADE,
        related_name='tags'
    )
    tag = models.CharField(max_length=100, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'asset_tags'
        unique_together = ['asset_group', 'tag']
        ordering = ['tag']
        verbose_name = 'Asset Tag'
        verbose_name_plural = 'Asset Tags'
        indexes = [
            models.Index(fields=['tag']),
        ]
    
    def __str__(self):
        return f"{self.asset_group.name} - {self.tag}"


class ActivityLog(models.Model):
    """
    Track user actions for auditing
    """
    ACTION_CHOICES = [
        ('upload', 'Upload'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('download', 'Download'),
        ('view', 'View'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    asset_group = models.ForeignKey(
        AssetGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    asset_version = models.ForeignKey(
        Asset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    details = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'activity_log'
        ordering = ['-timestamp']
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'
    
    def __str__(self):
        user_str = self.user.username if self.user else 'Unknown'
        asset_str = self.asset_group.name if self.asset_group else 'N/A'
        return f"{user_str} - {self.action} - {asset_str} at {self.timestamp}"
    
class AuthToken(models.Model):
    """
    Custom authentication token for users
    """
    key = models.CharField(max_length=40, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='auth_tokens')
    created = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'auth_tokens'
    
    def __str__(self):
        return f"Token for {self.user.username}"
    
    @staticmethod
    def generate_key():
        import secrets
        return secrets.token_hex(20)