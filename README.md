# Course Registration Portal

A full-stack university course registration system built with **Next.js** (frontend) and **Django REST Framework** (backend).

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui |
| Backend  | Django 4.2, Django REST Framework, SimpleJWT |
| Database | SQLite (zero config)                |

## Project Structure

```
UGAC_Assignment/
├── backend/
│   ├── core/          # Django settings, root URLs, WSGI
│   ├── users/         # Custom user model (email auth, role field)
│   ├── courses/       # Course model + public & admin views
│   ├── registrations/ # Registration model + student & admin views
│   ├── manage.py
│   ├── seed.py        # Pre-loads demo data
│   └── requirements.txt
├── frontend/
│   ├── app/           # Next.js pages (login, register, courses, dashboard, admin)
│   ├── components/    # App shell, shadcn/ui components
│   ├── lib/           # API client, auth context
│   └── package.json
├── .env.example
└── README.md
```

## Quick Start

### 1. Backend

```bash
cd backend

# Create a virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Load seed data (demo users + courses)
python seed.py

# Start the server
python manage.py runserver 8000
```

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp ../.env.example .env.local
# Or simply create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Start the dev server
npm run dev
```

### 3. Open the App

Visit **http://localhost:3000** in your browser.

## Demo Accounts

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@university.edu   | admin123    |
| Student | alice@university.edu   | student123  |
| Student | bob@university.edu     | student123  |

## API Endpoints

| Method | Endpoint                     | Description                   | Auth     |
|--------|------------------------------|-------------------------------|----------|
| POST   | `/api/auth/register/`        | Create new account            | Public   |
| POST   | `/api/auth/login/`           | Get JWT tokens                | Public   |
| GET    | `/api/auth/me/`              | Current user profile          | Required |
| GET    | `/api/courses/`              | List all courses              | Public   |
| GET    | `/api/courses/:id/`          | Course detail                 | Public   |
| POST   | `/api/registrations/`        | Register for a course         | Required |
| GET    | `/api/registrations/me/`     | My registrations              | Required |
| GET    | `/api/admin/registrations/`  | All registrations             | Admin    |
| PATCH  | `/api/admin/registrations/:id/` | Accept/reject registration | Admin    |
| POST   | `/api/admin/courses/`        | Create course                 | Admin    |
| PUT    | `/api/admin/courses/:id/`    | Update course                 | Admin    |
| DELETE | `/api/admin/courses/:id/delete/` | Delete course             | Admin    |

## Features

- [x] JWT authentication (login / register / logout)
- [x] Role-based access control (student vs admin)
- [x] Browse all courses with seat availability
- [x] View course details and register
- [x] Student dashboard with registration status tracking
- [x] Admin: create, edit, delete courses
- [x] Admin: accept or reject student registrations
- [x] Seat management (auto-adjusts on accept/reject)
- [x] Toast notifications for all actions
- [x] Loading and empty states
- [x] Form validation with error messages
- [x] Responsive layout (mobile + desktop)

## Environment Variables

See `.env.example` for all available variables:

- `DJANGO_SECRET_KEY` — Django secret key (has a dev default)
- `DJANGO_DEBUG` — Set to `True` for development
- `NEXT_PUBLIC_API_URL` — Backend API base URL (default: `http://localhost:8000/api`)
