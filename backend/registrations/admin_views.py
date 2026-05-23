# registrations/admin_views.py — Admin views for managing all registrations.

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import Registration
from .serializers import RegistrationDetailSerializer, AdminRegistrationUpdateSerializer
from courses.models import Course


class IsAdmin(permissions.BasePermission):
    """Only allow users with role='admin'."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class AdminRegistrationListView(generics.ListAPIView):
    """GET /api/admin/registrations/ — list every registration."""

    queryset = Registration.objects.all().select_related('user', 'course')
    serializer_class = RegistrationDetailSerializer
    permission_classes = [IsAdmin]


class AdminRegistrationUpdateView(generics.UpdateAPIView):
    """PATCH /api/admin/registrations/:id/ — accept or reject a registration.
    When accepting, decrements seats_left on the course.
    When rejecting a previously accepted registration, increments seats_left.
    """

    queryset = Registration.objects.all()
    serializer_class = AdminRegistrationUpdateSerializer
    permission_classes = [IsAdmin]

    def partial_update(self, request, *args, **kwargs):
        registration = self.get_object()
        new_status = request.data.get('status')

        if new_status not in ('accepted', 'rejected', 'pending'):
            return Response(
                {'detail': 'Invalid status.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_status = registration.status
        course = registration.course

        # Adjust seat count
        if new_status == 'accepted' and old_status != 'accepted':
            if course.seats_left <= 0:
                return Response(
                    {'detail': 'No seats available.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            course.seats_left -= 1
            course.save()
        elif new_status != 'accepted' and old_status == 'accepted':
            course.seats_left += 1
            course.save()

        registration.status = new_status
        registration.save()

        serializer = RegistrationDetailSerializer(registration)
        return Response(serializer.data)
