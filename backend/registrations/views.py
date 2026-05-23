# registrations/views.py — Student registration views (create + list own).

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import Registration
from .serializers import RegistrationSerializer, RegistrationDetailSerializer
from courses.models import Course


class CreateRegistrationView(generics.CreateAPIView):
    """POST /api/registrations/ — student registers for a course."""

    serializer_class = RegistrationSerializer

    def create(self, request, *args, **kwargs):
        course_id = request.data.get('course')

        # Check course exists
        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist:
            return Response(
                {'detail': 'Course not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check for duplicate registration
        if Registration.objects.filter(user=request.user, course=course).exists():
            return Response(
                {'detail': 'You have already registered for this course.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check seats
        if course.seats_left <= 0:
            return Response(
                {'detail': 'No seats available.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        registration = Registration.objects.create(
            user=request.user,
            course=course,
            status='pending',
        )
        serializer = RegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyRegistrationsView(generics.ListAPIView):
    """GET /api/registrations/me/ — list the current user's registrations."""

    serializer_class = RegistrationDetailSerializer

    def get_queryset(self):
        return Registration.objects.filter(user=self.request.user)
