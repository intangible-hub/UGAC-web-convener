# registrations/admin_urls.py — Admin routes for registration + course management.

from django.urls import path
from .admin_views import AdminRegistrationListView, AdminRegistrationUpdateView
from courses.views import AdminCourseCreateView, AdminCourseUpdateView, AdminCourseDeleteView

urlpatterns = [
    path('registrations/', AdminRegistrationListView.as_view(), name='admin-registration-list'),
    path('registrations/<int:pk>/', AdminRegistrationUpdateView.as_view(), name='admin-registration-update'),
    path('courses/', AdminCourseCreateView.as_view(), name='admin-course-create'),
    path('courses/<int:pk>/', AdminCourseUpdateView.as_view(), name='admin-course-update'),
    # DELETE uses the same path as update, Django routes by HTTP method
]

# Add delete route separately since UpdateView and DestroyView share the same path
urlpatterns.append(
    path('courses/<int:pk>/delete/', AdminCourseDeleteView.as_view(), name='admin-course-delete'),
)
