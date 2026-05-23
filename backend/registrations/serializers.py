# registrations/serializers.py — Serializers for student and admin registration views.

from rest_framework import serializers
from .models import Registration


class RegistrationSerializer(serializers.ModelSerializer):
    """Used when a student creates a registration (POST)."""

    class Meta:
        model = Registration
        fields = ['id', 'user', 'course', 'status', 'created_at']
        read_only_fields = ['id', 'user', 'status', 'created_at']


class RegistrationDetailSerializer(serializers.ModelSerializer):
    """Read-only view with nested course and user names."""

    course_title = serializers.CharField(source='course.title', read_only=True)
    course_instructor = serializers.CharField(source='course.instructor', read_only=True)
    course_schedule = serializers.CharField(source='course.schedule', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Registration
        fields = [
            'id', 'user', 'course', 'status', 'created_at',
            'course_title', 'course_instructor', 'course_schedule',
            'user_name', 'user_email',
        ]
        read_only_fields = fields


class AdminRegistrationUpdateSerializer(serializers.ModelSerializer):
    """Admin can only update the status field."""

    class Meta:
        model = Registration
        fields = ['id', 'status']
        read_only_fields = ['id']
