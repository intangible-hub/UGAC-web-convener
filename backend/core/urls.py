# core/urls.py — Root URL configuration.
# Routes /api/ traffic to each app's own urls.py.

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/registrations/', include('registrations.urls')),
    path('api/admin/', include('registrations.admin_urls')),
]
