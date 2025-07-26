#!/bin/bash

# Git Galaxy FastAPI Docker Runner
# This script provides easy commands to run the FastAPI application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install it and try again."
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Git Galaxy FastAPI Docker Runner"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start the application with Docker Compose"
    echo "  stop        Stop the application"
    echo "  restart     Restart the application"
    echo "  build       Build the Docker image"
    echo "  logs        Show application logs"
    echo "  shell       Open a shell in the running container"
    echo "  clean       Remove containers and images"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start    # Start the application"
    echo "  $0 logs     # View logs"
    echo "  $0 stop     # Stop the application"
}

# Function to start the application
start_app() {
    print_status "Starting Git Galaxy FastAPI application..."
    check_docker
    check_docker_compose
    
    docker-compose up -d --build
    print_success "Application started successfully!"
    print_status "Access the application at: http://localhost:8000"
    print_status "API Documentation: http://localhost:8000/docs"
    print_status "Health Check: http://localhost:8000/health"
}

# Function to stop the application
stop_app() {
    print_status "Stopping Git Galaxy FastAPI application..."
    docker-compose down
    print_success "Application stopped successfully!"
}

# Function to restart the application
restart_app() {
    print_status "Restarting Git Galaxy FastAPI application..."
    docker-compose down
    docker-compose up -d --build
    print_success "Application restarted successfully!"
}

# Function to build the application
build_app() {
    print_status "Building Git Galaxy FastAPI Docker image..."
    docker-compose build --no-cache
    print_success "Docker image built successfully!"
}

# Function to show logs
show_logs() {
    print_status "Showing application logs..."
    docker-compose logs -f
}

# Function to open shell in container
open_shell() {
    print_status "Opening shell in the running container..."
    docker-compose exec api bash
}

# Function to clean up
clean_up() {
    print_warning "This will remove all containers and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up containers and images..."
        docker-compose down --rmi all --volumes --remove-orphans
        print_success "Cleanup completed successfully!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Main script logic
case "${1:-help}" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        restart_app
        ;;
    build)
        build_app
        ;;
    logs)
        show_logs
        ;;
    shell)
        open_shell
        ;;
    clean)
        clean_up
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 