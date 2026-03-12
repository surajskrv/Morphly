# Morphly - AI Job Application Automation Platform

Morphly is a full-stack platform designed to automate the job search process. It uses AI to fetch jobs, rank them based on your preferences, generate optimized resumes and cover letters, and auto-apply to relevant positions.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, ShadCN UI, Zustand, Axios
- **Backend**: FastAPI, Python, Beanie ODM, MongoDB, Redis, Celery
- **AI/Automation**: Google Gemini API (Generation), Playwright (Web Automation)
- **Deployment**: Docker, docker-compose

## Project Structure

```text
Morphly/
├── docker-compose.yml          # Orchestrates all services
├── frontend/                   # Next.js React Application
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── layout.tsx      # Root layout with dark mode
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── (auth)/         # Login and Registration flows
│   │   │   └── dashboard/      # Main user dashboard
│   │   ├── components/         # Reusable UI components (ShadCN)
│   │   ├── store/              # Zustand state management (auth, jobs)
│   │   └── services/           # Axios API client with JWT interceptor
├── backend/                    # FastAPI Python Application
│   ├── main.py                 # ← Entry point (uvicorn main:app)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env                    # Environment variables
│   └── app/                    # Core application package
│       ├── api/                # API endpoints (flat structure)
│       │   ├── router.py       # Central route aggregator
│       │   ├── deps.py         # Shared dependencies (auth)
│       │   ├── auth.py         # Register, Login, Get Me
│       │   ├── jobs.py         # List & fetch jobs
│       │   ├── preferences.py  # User job preferences CRUD
│       │   ├── applications.py # Job applications CRUD
│       │   ├── ai.py           # AI resume & cover letter generation
│       │   └── resume.py       # Resume file upload/download
│       ├── core/               # Application core
│       │   ├── config.py       # Settings & env variable loading
│       │   ├── database.py     # MongoDB/Beanie initialization
│       │   └── security.py     # Password hashing & JWT tokens
│       ├── models/             # Beanie Document models
│       │   ├── user.py
│       │   ├── job.py
│       │   ├── preference.py
│       │   └── application.py
│       ├── schemas/            # Pydantic request/response schemas
│       │   ├── user.py
│       │   ├── job.py
│       │   ├── preference.py
│       │   └── application.py
│       └── worker/             # Celery background tasks
│           ├── celery_app.py   # Celery configuration
│           ├── ai.py           # AI generation tasks
│           ├── jobs.py         # Job fetching task
│           └── playwright_applier.py  # Auto-apply task
```

---

## Detailed File Breakdown

### Backend (`/backend`)

| File | Purpose |
|---|---|
| `main.py` | Initializes FastAPI, CORS middleware, calls `init_db()` on startup, and includes the v1 API router |
| `app/core/config.py` | Loads environment variables via Pydantic `BaseSettings` (MongoDB URL, Redis, JWT secrets, API keys) |
| `app/core/database.py` | Connects to MongoDB using Motor and initializes Beanie with all Document models |
| `app/core/security.py` | Password hashing with bcrypt, JWT access token creation and verification |
| `app/api/router.py` | Aggregates all endpoint routers under one `api_router` with prefixes and tags |
| `app/api/deps.py` | Shared dependency injection — `get_current_user` extracts and validates JWT tokens |
| `app/api/auth.py` | User registration (with duplicate check), login (returns JWT), and `/me` endpoint |
| `app/api/jobs.py` | Lists jobs sorted by relevance score, triggers Celery background fetch |
| `app/api/preferences.py` | Create/update and retrieve user job preferences |
| `app/api/applications.py` | Create applications (triggers auto-apply task), list user's applications |
| `app/api/ai.py` | Triggers Celery tasks for AI resume and cover letter generation |
| `app/api/resume.py` | Upload, retrieve, and delete resume files (PDF/DOCX) |
| `app/models/*.py` | Beanie `Document` classes defining MongoDB collections (users, jobs, preferences, applications) |
| `app/schemas/*.py` | Pydantic schemas for strict request validation and response serialization (string IDs for MongoDB) |
| `app/worker/celery_app.py` | Configures Celery with Redis as broker/backend, registers all task modules |
| `app/worker/ai.py` | Celery tasks for Gemini resume and cover-letter generation |
| `app/worker/jobs.py` | Async task that fetches jobs based on user preferences and stores them in MongoDB |
| `app/worker/playwright_applier.py` | Async task that simulates the auto-apply process using Playwright |
| `app/scrapers/*.py` | Modular source scrapers (LinkedIn, Naukri, Internshala, Wellfound, Hirist, Adzuna backup) |
| `app/services/job_collector.py` | Runs all scrapers, normalizes payloads, deduplicates, and stores jobs |
| `app/services/job_matcher.py` | Scores jobs for recommendations using preferences |
| `app/services/gemini_service.py` | Gemini client wrapper (`gemini-1.5-flash`) |
| `app/tasks/scrape_jobs.py` | Scheduled Celery scraping tasks by source |

### Frontend (`/frontend`)

| File | Purpose |
|---|---|
| `src/app/dashboard/page.tsx` | Main dashboard — displays preferences and recommended jobs |
| `src/app/dashboard/resume/ResumeManager.tsx` | UI for uploading base PDF/DOCX resumes |
| `src/services/api.ts` | Axios instance with base URL and JWT interceptor |
| `src/store/auth.ts` | Zustand store for user session and token management |
| `src/store/jobs.ts` | Zustand store for fetching and caching job listings |

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and get JWT token |
| GET | `/api/v1/auth/me` | Get current user profile |

### Preferences
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/preferences/` | Create or update preferences |
| GET | `/api/v1/preferences/` | Get current preferences |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/jobs/` | List all fetched jobs |
| GET | `/api/v1/jobs/recommended` | List jobs sorted by match score |
| POST | `/api/v1/jobs/fetch` | Trigger background job fetch |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/applications/` | Create application (triggers auto-apply) |
| GET | `/api/v1/applications/` | List user's applications |

### AI Generation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/generate-resume` | Generate AI-optimized resume |
| POST | `/api/v1/ai/generate-cover-letter` | Generate AI cover letter |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/resume/upload` | Upload resume file |
| GET | `/api/v1/resume/` | Check if resume exists |
| DELETE | `/api/v1/resume/` | Delete uploaded resume |

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (running locally on port 27017)
- Redis (running locally on port 6379)

### Option 1: Run with Docker (Recommended)
```bash
docker-compose up --build
```
This starts MongoDB, Redis, the FastAPI API, and the Celery worker automatically.

### Option 2: Run Locally (Without Docker for the API)

**1. Start MongoDB and Redis** (either natively or via Docker):
```bash
docker-compose up -d db redis
```

**2. Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**3. Start the FastAPI server:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**4. Start the Celery worker** (in a separate terminal):
```bash
cd backend
celery -A app.worker.celery_app worker --loglevel=info
```

**5. Start the frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Access
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Environment Variables

Create a `.env` file in `/backend`:

```env
PROJECT_NAME=Morphly
MONGODB_URL=mongodb://localhost:27017
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://localhost:6379/0
GEMINI_API_KEY=
ADZUNA_APP_ID=
ADZUNA_API_KEY=
JSEARCH_API_KEY=
```
