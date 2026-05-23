# registrations/models.py — Registration model linking a user to a course with a status.

from django.conf import settings
from django.db import models


class Registration(models.Model):
    """Tracks a student's application to a course."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='registrations',
    )
    course = models.ForeignKey(
        'courses.Course',
        on_delete=models.CASCADE,
        related_name='registrations',
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'course')  # prevent duplicate registrations
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.name} → {self.course.title} ({self.status})'
