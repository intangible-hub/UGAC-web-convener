# courses/views.py — Public list/detail views and admin CRUD for courses.

from rest_framework import generics, permissions
from .models import Course
from .serializers import CourseSerializer


class IsAdmin(permissions.BasePermission):
    """Only allow users with role='admin'."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


# ── Public endpoints (any authenticated user) ──────────────────

class CourseListView(generics.ListAPIView):
    """GET /api/courses/ — list all courses."""
    queryset = Course.objects.all().order_by('-created_at')
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]


class CourseDetailView(generics.RetrieveAPIView):
    """GET /api/courses/:id/ — single course detail."""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]


# ── Admin-only endpoints ───────────────────────────────────────

class AdminCourseCreateView(generics.CreateAPIView):
    """POST /api/admin/courses/ — admin creates a course."""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAdmin]


class AdminCourseUpdateView(generics.UpdateAPIView):
    """PUT /api/admin/courses/:id/ — admin edits a course."""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAdmin]


class AdminCourseDeleteView(generics.DestroyAPIView):
    """DELETE /api/admin/courses/:id/ — admin deletes a course."""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAdmin]
