# users/serializers.py — Serializers for user registration and profile.

from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Handles new user sign-up. Password is write-only."""

    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'password', 'role']
        read_only_fields = ['id']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    """Read-only representation of a user (returned after login)."""

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role']
