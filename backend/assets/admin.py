from django.contrib import admin
from .models import AssetGroup, Asset, AssetTag, ActivityLog


@admin.register(AssetGroup)
class AssetGroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'asset_type', 'created_at', 'created_by']
    list_filter = ['asset_type', 'created_at']
    search_fields = ['name', 'created_by']


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ['asset_group', 'version_number', 'filename', 'file_size', 'uploaded_at']
    list_filter = ['file_type', 'uploaded_at']
    search_fields = ['filename', 'uploaded_by']


@admin.register(AssetTag)
class AssetTagAdmin(admin.ModelAdmin):
    list_display = ['asset_group', 'tag', 'created_at']
    list_filter = ['created_at']
    search_fields = ['tag']


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'asset_group', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['details']