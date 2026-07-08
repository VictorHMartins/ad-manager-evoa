from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.views.static import serve as static_serve
from rest_framework_simplejwt.views import (TokenObtainPairView,TokenRefreshView)


def media_serve(request, path):
    response = static_serve(request, path, document_root=settings.MEDIA_ROOT)
    response['Cache-Control'] = 'public, max-age=31536000, immutable'
    return response


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('ads.urls')),

    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),

    re_path(r'^media/(?P<path>.*)$', media_serve),
]