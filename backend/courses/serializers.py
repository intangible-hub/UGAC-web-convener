# courses/serializers.py — Serializer for reading and writing Course data.

from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'instructor',
                  'schedule', 'capacity', 'seats_left', 'created_at']
        read_only_fields = ['id', 'created_at']
