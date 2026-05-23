# seed.py — Creates demo users and courses for immediate testing.
# Run with: python manage.py shell < seed.py

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from courses.models import Course

User = get_user_model()

# ── Create users ───────────────────────────────────────────────
users_data = [
    {'email': 'admin@university.edu', 'name': 'Admin User', 'password': 'admin123', 'role': 'admin', 'is_staff': True},
    {'email': 'alice@university.edu', 'name': 'Alice Johnson', 'password': 'student123', 'role': 'student'},
    {'email': 'bob@university.edu', 'name': 'Bob Smith', 'password': 'student123', 'role': 'student'},
]

for data in users_data:
    if not User.objects.filter(email=data['email']).exists():
        User.objects.create_user(
            email=data['email'],
            name=data['name'],
            password=data['password'],
            role=data['role'],
            is_staff=data.get('is_staff', False),
        )
        print(f"Created user: {data['email']}")
    else:
        print(f"User already exists: {data['email']}")

# ── Create courses ─────────────────────────────────────────────
courses_data = [
    {
        'title': 'Introduction to Computer Science',
        'description': 'A broad introduction to computer science covering algorithms, data structures, and computational thinking. Suitable for beginners.',
        'instructor': 'Dr. Sarah Chen',
        'schedule': 'Mon/Wed 10:00–11:30',
        'capacity': 40,
        'seats_left': 40,
    },
    {
        'title': 'Data Structures and Algorithms',
        'description': 'Deep dive into arrays, linked lists, trees, graphs, sorting, and searching algorithms. Prerequisites: Intro to CS.',
        'instructor': 'Prof. James Miller',
        'schedule': 'Tue/Thu 14:00–15:30',
        'capacity': 35,
        'seats_left': 35,
    },
    {
        'title': 'Web Development Fundamentals',
        'description': 'Learn HTML, CSS, JavaScript, and modern frameworks. Build real-world projects from scratch.',
        'instructor': 'Dr. Priya Sharma',
        'schedule': 'Mon/Wed/Fri 09:00–10:00',
        'capacity': 30,
        'seats_left': 30,
    },
    {
        'title': 'Machine Learning',
        'description': 'Introduction to supervised and unsupervised learning, neural networks, and practical applications using Python.',
        'instructor': 'Prof. Michael Zhang',
        'schedule': 'Tue/Thu 11:00–12:30',
        'capacity': 25,
        'seats_left': 25,
    },
]

for data in courses_data:
    if not Course.objects.filter(title=data['title']).exists():
        Course.objects.create(**data)
        print(f"Created course: {data['title']}")
    else:
        print(f"Course already exists: {data['title']}")

print("\n✓ Seed data loaded successfully.")
print("  Admin:   admin@university.edu / admin123")
print("  Student: alice@university.edu / student123")
print("  Student: bob@university.edu   / student123")
