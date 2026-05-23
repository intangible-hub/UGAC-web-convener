# registrations/urls.py — Student-facing registration routes.

from django.urls import path
from .views import CreateRegistrationView, MyRegistrationsView

urlpatterns = [
    path('', CreateRegistrationView.as_view(), name='registration-create'),
    path('me/', MyRegistrationsView.as_view(), name='registration-me'),
]
