# Investment Platform Docker Compose Helper (PowerShell)

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Service = ""
)

$BackendDir = "C:\Projetos\investment-platform-backend"
$DockerComposeFile = "docker-compose.yml"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-DockerCompose {
    try {
        docker-compose --version | Out-Null
        return $true
    } catch {
        Write-Error "docker-compose not found. Please install Docker Compose."
        exit 1
    }
}

function Start-Services {
    Write-Status "Starting all services..."
    Set-Location $BackendDir
    docker-compose up -d
    Write-Status "Services started successfully!"
    Write-Status "Frontend: http://localhost:3000"
    Write-Status "Backend API: http://localhost:8000"
    Write-Status "Database: localhost:5432"
    Write-Status "Redis: localhost:6379"
}

function Stop-Services {
    Write-Status "Stopping all services..."
    Set-Location $BackendDir
    docker-compose down
    Write-Status "Services stopped successfully!"
}

function Show-Status {
    Write-Status "Checking services status..."
    Set-Location $BackendDir
    docker-compose ps
}

function Show-Logs {
    param([string]$ServiceName)
    Set-Location $BackendDir
    if ($ServiceName) {
        Write-Status "Showing logs for service: $ServiceName"
        docker-compose logs -f $ServiceName
    } else {
        Write-Status "Showing logs for all services"
        docker-compose logs -f
    }
}

function Rebuild-Services {
    Write-Status "Rebuilding all services..."
    Set-Location $BackendDir
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    Write-Status "Services rebuilt and started successfully!"
}

function Cleanup-Services {
    Write-Warning "This will remove all containers, networks, and volumes. Are you sure? (y/N)"
    $response = Read-Host
    if ($response -match "^[yY]") {
        Write-Status "Cleaning up..."
        Set-Location $BackendDir
        docker-compose down -v --remove-orphans
        docker system prune -f
        Write-Status "Cleanup completed!"
    } else {
        Write-Status "Cleanup cancelled."
    }
}

function Show-Help {
    Write-Host "Investment Platform Docker Helper (PowerShell)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\docker-helper.ps1 [command] [service]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor White
    Write-Host "  start    - Start all services" -ForegroundColor Gray
    Write-Host "  stop     - Stop all services" -ForegroundColor Gray
    Write-Host "  restart  - Restart all services" -ForegroundColor Gray
    Write-Host "  status   - Show services status" -ForegroundColor Gray
    Write-Host "  logs     - Show logs (optionally for specific service)" -ForegroundColor Gray
    Write-Host "  rebuild  - Rebuild and restart all services" -ForegroundColor Gray
    Write-Host "  cleanup  - Remove all containers, networks, and volumes" -ForegroundColor Gray
    Write-Host "  help     - Show this help message" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\docker-helper.ps1 start" -ForegroundColor Gray
    Write-Host "  .\docker-helper.ps1 logs frontend" -ForegroundColor Gray
    Write-Host "  .\docker-helper.ps1 logs backend" -ForegroundColor Gray
}

# Main execution
Test-DockerCompose

switch ($Command.ToLower()) {
    "start" { Start-Services }
    "stop" { Stop-Services }
    "restart" { 
        Stop-Services
        Start-Services
    }
    "status" { Show-Status }
    "logs" { Show-Logs $Service }
    "rebuild" { Rebuild-Services }
    "cleanup" { Cleanup-Services }
    default { Show-Help }
}