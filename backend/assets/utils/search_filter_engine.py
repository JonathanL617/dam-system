from typing import List, Dict

class SearchEngine:
    def __init__(self, db):
        self.db = db
    
    def search_by_filename(self, query: str) -> List[Dict]:
        sql = '''SELECT ag.* a.filename, a.file_path, a.thumbnail_path, a.version_number
                FROM asset_groups ag
                JOIN assets a ON
                ag.current_version_id = a.id
                WHERE ag.name LIKE ?
                OR a.filename LIKE ?
                '''
    
    def filter_by_type(self):
        pass

    def filter_by_date_range(self):
        pass

    def fillter_by_size(self):
        pass

    def search_by_tags(self):
        pass

    def advanced_search(self):
        pass