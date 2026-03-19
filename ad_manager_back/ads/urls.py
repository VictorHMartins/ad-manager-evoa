from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlaylistViewSet,
    PlaylistMidiaViewSet,
    FilaReproducaoViewSet,
    player_api
)

router = DefaultRouter()
router.register(r'playlists', PlaylistViewSet)
router.register(r'midias', PlaylistMidiaViewSet)
router.register(r'filas', FilaReproducaoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('player/', player_api),
]