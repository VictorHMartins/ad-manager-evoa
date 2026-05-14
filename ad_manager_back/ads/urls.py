from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlaylistViewSet,
    PlaylistMidiaViewSet,
    FilaReproducaoViewSet,
    DispositivoViewSet,
    player_api_tv,
)

router = DefaultRouter()
router.register(r'playlists', PlaylistViewSet)
router.register(r'midias', PlaylistMidiaViewSet)
router.register(r'filas', FilaReproducaoViewSet)
router.register(r'dispositivos', DispositivoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('player/<slug:codigo>/', player_api_tv),
]
