# Digital Asset Management (DAM) System

A scalable Digital Asset Management system for Visual AI applications with support for images, videos, and 3D models.

## Tech Stack

### Backend
- Python 3.13
- Django 5.2.7
- Django REST Framework
- PostgreSQL / SQLite

### Frontend
- Next.js (App Router)
- React
- Chakra UI
- Redux Toolkit
- Babylon.js (3D Viewer)

# Prerequisites
- Python 3.10+ installed
- Node.js 18+ installed
- Git installed

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/dam-system.git
cd dam-system
```

2. **Navigate to backend folder**
```bash
cd backend
```

3. **Create virtual environment**
```bash
python -m venv venv
```

4. **Activate virtual environment**

Windows:
```bash
venv\Scripts\activate
```

Mac/Linux:
```bash
source venv/bin/activate
```

5. **Install dependencies**
```bash
pip install -r requirement.txt
```

6. **Create `.env` file**

Create `backend/.env`:
```
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_NAME=dam_database
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

7. **Run migrations**
```bash
python manage.py migrate
```

8. **Create superuser**
```bash
python manage.py createsuperuser
```

9. **Run development server**
```bash
python manage.py runserver
```

Backend should be running at: http://127.0.0.1:8000/

---

## Frontend Setup

1. **Navigate to frontend folder**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env.local` file**

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

4. **Run development server**
```bash
npm run dev
```

Frontend should be running at: http://localhost:3000/

