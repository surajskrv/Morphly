Run Locally (Without Docker for the API)

**1. Start MongoDB and Redis** (either natively or via Docker):
```bash
docker-compose up -d db redis
```
-- if you running redis-server localy and getting already used then first kill the running process and then start
```bash
sudo lsof -i :6379
# you get the pid from here
# kill that pid
sudo kill -9 PID
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
