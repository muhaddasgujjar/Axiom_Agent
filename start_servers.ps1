# start_servers.ps1
# Launches the Axiom stack in two visible PowerShell windows with live logs.
$ErrorActionPreference = 'Continue'

# Kill any stale processes already bound to our ports before relaunching.
function Stop-StaleServer {
    param([int[]]$Ports)
    foreach ($port in $Ports) {
        $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        foreach ($conn in $conns) {
            $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "Stopping stale process $($proc.Id) ($($proc.ProcessName)) on port $port..."
                Stop-Process -Id $proc.Id -Force
            }
        }
    }
}
Stop-StaleServer -Ports @(8000, 5000, 3000)

$rootDir = 'E:\projects\Axiom_Agent'
$frontendDir = 'E:\projects\Axiom_Agent\Deep-Research'

# Window 1: Python FastAPI / LangGraph backend on port 8000
Start-Process powershell.exe -ArgumentList '-NoExit', '-ExecutionPolicy', 'Bypass', '-Command',
  "cd '$rootDir'; .\venv\Scripts\activate; uvicorn api.main:app --host 127.0.0.1 --port 8000"

# Window 2: Express API server (frontend + proxy) on port 5000
Start-Process powershell.exe -ArgumentList '-NoExit', '-ExecutionPolicy', 'Bypass', '-Command',
  "cd '$frontendDir'; `$env:PORT='5000'; `$env:DATABASE_URL='postgres://postgres@127.0.0.1:5432/axiom'; pnpm --filter @workspace/api-server run dev"

# Window 3: Vite dashboard on port 3000 (proxies /api -> localhost:5000)
Start-Process powershell.exe -ArgumentList '-NoExit', '-ExecutionPolicy', 'Bypass', '-Command',
  "cd '$frontendDir'; `$env:PORT='3000'; pnpm --filter @workspace/axiom-research run dev"
