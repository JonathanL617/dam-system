from typing import List, Dict, Optional
from django.db.models import Max, F
from ..models import AssetGroup, Asset, AssetTag

class AssetRetriever:
    
    def get_asset_by_id(self, asset_group_id: int) -> Optional[Dict]:
        try:
            g = AssetGroup.objects.select_related("current_version").get(pk=asset_group_id)
            return self._group_dict(g)
        except AssetGroup.DoesNotExist:
            return None

    def get_all_versions(self, asset_group_id: int) -> List[Dict]:
        return list(
            Asset.objects.filter(asset_group_id=asset_group_id)
            .order_by("-version_number")
            .values(
                "id","version_number","version_label","filename","file_path",
                "file_size","mime_type","thumbnail_path","web_version_path",
                "uploaded_at","uploaded_by","change_notes","metadata_json",
                "width","height","duration"
            )
        )

    def get_specific_version(self, asset_group_id: int, version_number: int) -> Optional[Dict]:
        try:
            return Asset.objects.filter(
                asset_group_id=asset_group_id, version_number=version_number
            ).values(
                "id","version_number","version_label","filename","file_path",
                "file_size","mime_type","thumbnail_path","web_version_path",
                "uploaded_at","uploaded_by","change_notes","metadata_json",
                "width","height","duration"
            ).get()
        except Asset.DoesNotExist:
            return None

    def get_all_assets(self, limit: int = 50, offset: int = 0, ordering: str = "-created_at") -> tuple[List[Dict], int]:
        qs = AssetGroup.objects.select_related("current_version").order_by(ordering)
        total = qs.count()
        groups = qs[offset: offset + limit]
        
        return [self._group_dict(g) for g in groups], total

    def get_asset_tags(self, asset_group_id: int) -> List[str]:
        return list(
            AssetTag.objects.filter(asset_group_id=asset_group_id)
            .values_list("tag", flat=True)
            .order_by("tag")
        )
    
    @staticmethod
    def _group_dict(g: AssetGroup) ->   Dict:
        current = g.current_version

        return {
            "id": g.id,
            "name": g.name,
            "asset_type": g.asset_type,
            "created_at": g.created_at.isoformat(),
            "created_by": g.created_by,
            "current_version_id": current.id if current else None,
            "filename": current.filename if current else None,
            "file_path": current.file_path if current else None,
            "thumbnail_path": current.thumbnail_path if current else None,
            "file_size": current.file_size if current else None,
            "mime_type": current.mime_type if current else None,
            "uploaded_at": current.uploaded_at.isoformat() if current else None,
            "metadata": current.metadata_json if current else None,
        }

    