# Python 3.12 base image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy .env file if exists (optional, can use docker-compose env instead)
# COPY .env .env

# Expose port 9000
EXPOSE 9000

# Health check - use wget instead of requests
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:9000/api/register/ || exit 1

# Run gunicorn with extended timeout for long-running AI image generation
CMD ["gunicorn", "--bind", "0.0.0.0:9000", "--workers", "3", "--timeout", "1500", "myproject.wsgi:application"]
