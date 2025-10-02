#!/bin/bash

# Investment Platform Docker Compose Helper

set -e

DOCKER_COMPOSE_FILE="./docker-compose.yml"
BACKEND_DIR="C:/Projetos/investment-platform-backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if docker-compose exists
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose not found. Please install Docker Compose."
        exit 1
    fi
}

# Start all services
start_services() {
    print_status "Starting all services..."
    cd "$BACKEND_DIR"
    docker-compose up -d
    print_status "Services started successfully!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:8000"
    print_status "Database: localhost:5432"
    print_status "Redis: localhost:6379"
}

# Stop all services
stop_services() {
    print_status "Stopping all services..."
    cd "$BACKEND_DIR"
    docker-compose down
    print_status "Services stopped successfully!"
}

# Show services status
show_status() {
    print_status "Checking services status..."
    cd "$BACKEND_DIR"
    docker-compose ps
}

# Show logs
show_logs() {
    service=${1:-""}
    cd "$BACKEND_DIR"
    if [ -n "$service" ]; then
        print_status "Showing logs for service: $service"
        docker-compose logs -f "$service"
    else
        print_status "Showing logs for all services"
        docker-compose logs -f
    fi
}

# Rebuild services
rebuild_services() {
    print_status "Rebuilding all services..."
    cd "$BACKEND_DIR"
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    print_status "Services rebuilt and started successfully!"
}

# Clean up (remove containers, networks, volumes)
cleanup() {
    print_warning "This will remove all containers, networks, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]; then
        print_status "Cleaning up..."
        cd "$BACKEND_DIR"
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_status "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Main function
main() {
    check_docker_compose
    
    case "${1:-help}" in
        "start")
            start_services
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            start_services
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "rebuild")
            rebuild_services
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|*)
            echo "Investment Platform Docker Helper"
            echo ""
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  start    - Start all services"
            echo "  stop     - Stop all services" 
            echo "  restart  - Restart all services"
            echo "  status   - Show services status"
            echo "  logs     - Show logs (optionally for specific service)"
            echo "  rebuild  - Rebuild and restart all services"
            echo "  cleanup  - Remove all containers, networks, and volumes"
            echo "  help     - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 start"
            echo "  $0 logs frontend"
            echo "  $0 logs backend"
            ;;
    esac
}

main "$@"