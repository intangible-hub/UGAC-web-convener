# courses/models.py — Course model with title, instructor, schedule, and seat tracking.

from django.db import models


class Course(models.Model):
    """A university course that students can register for."""

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    instructor = models.CharField(max_length=150)
    schedule = models.CharField(max_length=200, help_text='e.g. Mon/Wed 10:00–11:30')
    capacity = models.PositiveIntegerField(default=30)
    seats_left = models.PositiveIntegerField(default=30)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
