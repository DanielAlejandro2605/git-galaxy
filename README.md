# Git Galaxy

A FastAPI application for Git Galaxy with Docker support and gitingest integration for Git repository text generation.

## Features

- FastAPI REST API
- Docker containerization
- Health check endpoint
- CORS support
- Interactive API documentation
- Git repository text generation using gitingest
- Sample Git repository endpoints

## API Endpoints

- `GET /` - Root endpoint with API information
- `GET /health` - Health check endpoint
- `POST /gitingest` - Generate text file from Git repository
- `GET /gitingest/download` - Download generated text file from Git repository
- `GET /repos` - Get all repositories
- `GET /repos/{repo_name}` - Get a specific repository
- `POST /repos` - Create a new repository
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation (ReDoc)

## Gitingest Integration

The application integrates with [gitingest](https://gitingest.com) to convert Git repositories into prompt-friendly text files for LLMs.

### Using the Gitingest Endpoints

#### POST /gitingest
Generate a text file from a Git repository:

```bash
curl -X POST "http://localhost:8000/gitingest" \
  -H "Content-Type: application/json" \
  -d '{
    "repository_url": "https://github.com/username/repo",
    "token": "github_pat_...",
    "include_submodules": false,
    "include_gitignored": false
  }'
```

#### GET /gitingest/download
Download the generated text file:

```bash
curl -X GET "http://localhost:8000/gitingest/download?repository_url=https://github.com/username/repo&token=github_pat_..."
```

### Parameters

- `repository_url` (required): Git repository URL
- `token` (optional): GitHub Personal Access Token for private repositories
- `include_submodules` (optional): Include repository submodules (default: false)
- `include_gitignored` (optional): Include files listed in .gitignore (default: false)

## Quick Start with Docker

### Option 1: Using Docker Compose (Recommended)

1. **Build and run the application:**
   ```bash
   docker-compose up --build
   ```

2. **Run in background:**
   ```bash
   docker-compose up -d --build
   ```

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Option 2: Using Docker directly

1. **Build the Docker image:**
   ```bash
   docker build -t git-galaxy .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8000:8000 git-galaxy
   ```

3. **Run in background:**
   ```bash
   docker run -d -p 8000:8000 --name git-galaxy-app git-galaxy
   ```

4. **Stop the container:**
   ```bash
   docker stop git-galaxy-app
   docker rm git-galaxy-app
   ```

## Development

### Local Development (without Docker)

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application:**
   ```bash
   python main.py
   ```

3. **Or using uvicorn directly:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Access the Application

Once running, you can access:

- **API Base URL:** http://localhost:8000
- **Interactive Documentation:** http://localhost:8000/docs
- **Alternative Documentation:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

## Example Usage

### Generate text from a public repository:
```bash
curl -X POST "http://localhost:8000/gitingest" \
  -H "Content-Type: application/json" \
  -d '{
    "repository_url": "https://github.com/fastapi/fastapi"
  }'
```

### Download text file from a private repository:
```bash
curl -X GET "http://localhost:8000/gitingest/download?repository_url=https://github.com/username/private-repo&token=github_pat_..."
```

## Docker Commands Reference

### Build Commands
```bash
# Build with Docker Compose
docker-compose build

# Build with Docker
docker build -t git-galaxy .

# Build with specific tag
docker build -t git-galaxy:v1.0.0 .
```

### Run Commands
```bash
# Run with Docker Compose
docker-compose up

# Run in background with Docker Compose
docker-compose up -d

# Run with Docker
docker run -p 8000:8000 git-galaxy

# Run with custom port
docker run -p 3000:8000 git-galaxy
```

### Management Commands
```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove containers and images
docker-compose down --rmi all

# Execute commands in container
docker-compose exec api bash

# View running containers
docker ps
```

### Health Check
The application includes a health check endpoint that Docker uses to monitor the container status:

```bash
# Test health check manually
curl http://localhost:8000/health
```

## Environment Variables

- `PORT`: Port number (default: 8000)
- `PYTHONUNBUFFERED`: Set to 1 for unbuffered output
- `PYTHONDONTWRITEBYTECODE`: Set to 1 to prevent .pyc files
- `GITHUB_TOKEN`: GitHub Personal Access Token for private repositories

## Project Structure

```
git-galaxy/
├── main.py              # FastAPI application with gitingest integration
├── requirements.txt      # Python dependencies including gitingest
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
├── .dockerignore        # Files to exclude from Docker build
├── run.sh              # Convenience script for managing the application
└── README.md           # This file
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using port 8000
   lsof -i :8000
   
   # Use a different port
   docker run -p 8001:8000 git-galaxy
   ```

2. **Permission issues:**
   ```bash
   # Run with sudo if needed
   sudo docker-compose up
   ```

3. **Build cache issues:**
   ```bash
   # Force rebuild
   docker-compose build --no-cache
   ```

4. **Container not starting:**
   ```bash
   # Check logs
   docker-compose logs api
   ```

5. **Gitingest errors:**
   ```bash
   # Check if repository is accessible
   curl -I https://github.com/username/repo
   
   # Verify token permissions for private repos
   curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).