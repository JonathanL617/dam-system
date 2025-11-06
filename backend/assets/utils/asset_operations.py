from django.db import transaction, models
from typing import List, Dict, Optional, Any
from ..models import AssetGroup, Asset, AssetTag

class AssetManager:

    @transaction.atomic
    def create_asset(self, name: str, asset_type: str, file_info: Dict[str, Any], metadata: Dict[str, Any], user: str, version_label: str = "", change_notes: str = "",) -> Optional[Dict]:
        group = AssetGroup.objects.create(
            name=name,
            asset_type=asset_type,
            created_by=user,
            current_version_id=None  # will be set later
        )

        version = self._make_version(group, 1, version_label, file_info, metadata, user, change_notes)

        group.current_version_id = version.id
        group.save(update_fields=['current_version_id'])

        return group.id
        
    @transaction.atomic
    def create_new_version(self, asset_group_id: int, file_info: Dict,
                          metadata: Dict = None, user: str = None,
                          change_notes: str = "", version_label: str = "") -> int:
        
        group = AssetGroup.objects.select_for_update().get(pk = asset_group_id)

        next_num = (Asset.objects.filter(asset_group = group).aggregate(m = models.Max("version_number"))["m"] or 0) + 1
        
        version = self._make_version(group, next_num, version_label, file_info, metadata, user, change_notes)
        group.current_version = version
        group.save(update_fields=["current_version"])
        return version.id

    def _make_version(self, group, num, label, file_info, meta, user, notes):
        return Asset.objects.create(
            asset_group=group,
            version_number=num,
            version_label=label,
            filename=file_info["stored_filename"],
            file_path=file_info["file_path"],
            file_size=file_info["file_size"],
            file_type=file_info["asset_type"],
            mime_type=file_info.get("mime_type"),
            width=meta.get("width"),
            height=meta.get("height"),
            duration=meta.get("duration_seconds"),
            metadata_json=meta,
            thumbnail_path=file_info.get("thumbnail_path", ""),
            web_version_path=file_info.get("web_version_path", ""),
            uploaded_by=user,
            change_notes=notes,
        )

    @transaction.atomic
    def update_asset_metadata(self, asset_group_id: int, updates: Dict[str, Any]) -> bool:
        allowed = {"name"}
        to_set = {k: v for k, v in updates.items() if k in allowed}
        if not to_set:
            return False
        return AssetGroup.objects.filter(pk=asset_group_id).update(**to_set) > 0

    @transaction.atomic
    def add_tags(self, asset_group_id: int, tags: List[str]) -> bool:
        objs = [
            AssetTag(asset_group_id=asset_group_id, tag=t.strip().lower())
            for t in tags if t.strip()
        ]
        AssetTag.objects.bulk_create(objs, ignore_conflicts=True)
        return True
    
    @transaction.atomic
    def remove_tags(self, asset_group_id: int, tags: List[str]) -> bool:
        AssetTag.objects.filter(
            asset_group_id=asset_group_id,
            tag__in=[t.strip().lower() for t in tags if t.strip()]
        ).delete()
        return True

    @transaction.atomic
    def delete_asset(self, asset_group_id: int) -> bool:
        AssetGroup.objects.filter(pk=asset_group_id).delete()
        return True

    @transaction.atomic
    def delete_version(self, asset_group_id: int, version_number: int) -> bool:
        group = AssetGroup.objects.select_for_update().get(pk=asset_group_id)
        versions_qs = Asset.objects.filter(asset_group=group)

        if versions_qs.count() <= 1:
            raise ValueError("Cannot delete the only version")

        deleted, _ = versions_qs.filter(version_number=version_number).delete()
        if not deleted:
            return False

        if group.current_version and group.current_version.version_number == version_number:
            new_cur = versions_qs.order_by("-version_number").first()
            group.current_version = new_cur
            group.save(update_fields=["current_version"])
        return True
    