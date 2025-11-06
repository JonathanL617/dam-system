from django.db.models import Q, F
from ..models import AssetGroup

class SearchEngine:
    def _base(self):
        return AssetGroup.objects.select_related('current_version').annotate(
            filename=F('current_version__filename'),
            file_path=F('current_version__file_path'),
            thumbnail_path=F('current_version__thumbnail_path'),
            file_size=F('current_version__file_size'),
            uploaded_at=F('current_version__uploaded_at')
        ).values('id', 'name', 'asset_type', 'filename', 'file_path', 'thumbnail_path', 'file_size', 'uploaded_at')
    
    def search_by_filename(self, query: str):
        return list(self._base().filter(Q(name__icontains = query) | Q(current_version__filename__icontains = query)))
    
    def filter_by_type(self, asset_type: str):
        return list(self._base().filter(asset_type = asset_type))

    def filter_by_date_range(self, start_date: str, end_date: str):
        return list(self._base().filter(current_version__uploaded_at__date__range=[start_date, end_date]))

    def filter_by_size(self, min_size: int=0, max_size: int = None):
        qs = self._base().filter(current_version__file_size__gte=min_size)
        
        if max_size: 
            qs = qs.filter(current_version__file_size__lte=max_size)
        
        return list(qs)

    def search_by_tags(self, tags):
        return list(self._base().filter(tags__tag__in = tags).distinct())
    

    def advanced_search(self, filters):
        qs = self._base()
        if q := filters.get('query'):
            qs = qs.filter(Q(name__icontains=q) | Q(current_version__filename__icontains=q))
        if t := filters.get('asset_type'): qs = qs.filter(asset_type=t)
        if s := filters.get('start_date'): qs = qs.filter(current_version__uploaded_at__date__gte = s)
        if e := filters.get('end_date'): qs = qs.filter(current_version__uploaded_at__date__lte = e)
        if m := filters.get('min_size'): qs = qs.filter(current_version__file_size__gte = m)
        if M := filters.get('max_size'): qs = qs.filter(current_version__file_size__lte = M)
        if tags := filters.get('tags'): qs = qs.filter(tags__tag__in=tags).distinct()
        
        return list(qs)