# start_servers.ps1
# Launches the Axiom stack in two visible PowerShell windows with live logs.
$ErrorActionPreference = 'Continue'

$rootDir = 'E:\projects\Axiom_Agent'
$frontendDir = 'E:\projects\Axiom_Agent\Deep-Research'

# Window 1: Python FastAPI / LangGraph backend on port 8000
Start-Process powershell.exe -ArgumentList '-NoExit', '-ExecutionPolicy', 'Bypass', '-Command',
  "cd '$rootDir'; .\venv\Scripts\activate; uvicorn api.main:app --host 127.0.0.1 --port 8000"

# Window 2: Express API server (frontend + proxy) on port 5000
Start-Process powershell.exe -ArgumentList '-NoExit', '-ExecutionPolicy', 'Bypass', '-Command',
  "cd '$frontendDir'; `$env:PORT='5000'; `$env:DATABASE_URL='postgres://postgres@127.0.0.1:5432/axiom'; pnpm --filter @workspace/api-server run dev"
