from django.apps import AppConfig
from django.db.utils import OperationalError, ProgrammingError

class AssetsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'assets'
    label = 'dam_assets'

    def ready(self):
        # Only run when the app is fully loaded
        from assets.utils.api_views import create_initial_admin

        try:
            create_initial_admin()
            if(create_initial_admin()):
                print('admin created succesfully')
        except (OperationalError, ProgrammingError):
            # Database not ready (e.g., during migrate)
            pass
