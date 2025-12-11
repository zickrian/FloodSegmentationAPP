# Script to start both backend and frontend servers

Write-Host "Starting Flood Segmentation Application..." -ForegroundColor Green
Write-Host ""

# Terminal 1: Backend
Write-Host "Starting Backend Server (port 8000)..." -ForegroundColor Cyan
$backend = Start-Process -FilePath python `
    -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload" `
    -WorkingDirectory "$PSScriptRoot\backend" `
    -PassThru `
    -NoNewWindow

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Terminal 2: Frontend
Write-Host "Starting Frontend Server (port 3000)..." -ForegroundColor Cyan
$frontend = Start-Process -FilePath npm `
    -ArgumentList "run dev" `
    -WorkingDirectory "$PSScriptRoot" `
    -PassThru `
    -NoNewWindow

Write-Host ""
Write-Host "✅ Both servers started!" -ForegroundColor Green
Write-Host "Backend:  http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to stop servers..." -ForegroundColor Gray
Read-Host

# Kill both processes
Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue

Write-Host "Servers stopped." -ForegroundColor Red
