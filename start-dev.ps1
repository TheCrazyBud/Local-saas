# Start infrastructure services via Docker Compose
Write-Host "Starting infrastructure services (Postgres, Redis, Ollama)..."
docker-compose up -d postgres redis ollama

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker compose failed. Make sure Docker Desktop is running." -ForegroundColor Red
    exit 1
}

# Start Control Plane (Next.js)
Write-Host "Starting Control Plane..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd control-plane; npm install; npm run dev"

# Start LLM Gateway
Write-Host "Starting LLM Gateway..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd data-plane\llm-gateway; if (!(Test-Path .venv)) { python -m venv .venv }; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt; uvicorn main:app --reload --port 8000"

# Start HR Agent
Write-Host "Starting HR Agent..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd data-plane\agents; if (!(Test-Path .venv)) { python -m venv .venv }; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt; uvicorn main:app --reload --port 8001"

Write-Host "All services have been started in development mode!" -ForegroundColor Green
