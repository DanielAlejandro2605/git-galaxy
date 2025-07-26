# Git Galaxy

A FastAPI application for Git Galaxy with Docker support and repos relationships visualization in an interactive graph.

## Features

- FastAPI REST API
- Docker containerization
- Health check endpoint
- CORS support
- Interactive API documentation
- Git repository metadata extraction
- Visualization of Repos relationships in a graph structure

## Demo

[![Watch the video](https://vimeo.com/1104748922/0f345fd5c1?ts=114603&share=copy)](https://vimeo.com/1104748922/0f345fd5c1?ts=114603&share=copy)


## Quick Start with Docker

### Option 1: Using Docker Compose (Recommended)

1. **Build and run the application:**
   ```bash
   docker compose up --build
   ```

2. **Run in background:**
   ```bash
   docker compose up -d --build
   ```

3. **Stop the application:**
   ```bash
   docker compose down
   ```

## Development

### Local Development (without Docker)

Don't forget to source venv/bin/activate if you don't want to install dependencies globally

**Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

**Or using uvicorn directly:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Environment Variables

- `PORT`: Port number (default: 8000)
- `PYTHONUNBUFFERED`: Set to 1 for unbuffered output
- `PYTHONDONTWRITEBYTECODE`: Set to 1 to prevent .pyc files
- `GITHUB_TOKEN`: GitHub Personal Access Token for private repositories
- `OPENAI_API_TOKEN`: OpenAI API Token to generate search queries parameters


## License

This project is open source and available under the [MIT License](LICENSE).
