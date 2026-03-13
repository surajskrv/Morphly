# --- Stage 1: The Base (Everything common) ---
FROM python:3.11-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc python3-dev && rm -rf /var/lib/apt/lists/*
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app

# --- Stage 2: The API (Small) ---
FROM base AS api-dist
USER appuser
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# --- Stage 3: The Scraper (Heavy with Playwright) ---
FROM base AS scraper-dist
USER root
RUN playwright install --with-deps chromium && rm -rf /var/lib/apt/lists/*
USER appuser
