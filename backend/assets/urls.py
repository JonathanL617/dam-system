from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/login/', views.login_view.as_view(), name='login'),

    # Upload
    path('upload/', views.UploadAssetView.as_view(), name='upload'),

    # Assets
    path('', views.AssetListView.as_view(), name='asset-list'),
    path('<int:pk>/', views.AssetDetailView.as_view(), name='asset-detail'),
    path('<int:pk>/delete/', views.AssetDeleteView.as_view(), name='asset-delete'),

    # Versions
    path('<int:group_id>/versions/', views.VersionListView.as_view(), name='versions'),

    # Tags
    path('<int:pk>/tags/add/', views.TagAddView.as_view(), name='tag-add'),
    path('<int:pk>/tags/remove/', views.TagRemoveView.as_view(), name='tag-remove'),

    # Search
    path('search/', views.SearchView.as_view(), name='search'),
]