# Frontend Service

This is the React frontend for the Git Galaxy project, built with Vite, TypeScript, and Tailwind CSS.

## Project Structure

```
services/frontend/
├── dev/                    # Docker configuration files
│   ├── Dockerfile         # Production Dockerfile
│   ├── Dockerfile.dev     # Development Dockerfile
│   └── .dockerignore      # Docker ignore file
└── repo-constellation/    # Frontend source code
    ├── src/               # React source code
    ├── public/            # Static assets
    ├── package.json       # Dependencies
    └── ...                # Other config files
```

## Development

To run the frontend in development mode:

```bash
# Using Docker Compose (recommended)
docker-compose up frontend

# Or using Docker directly
docker build -f services/frontend/dev/Dockerfile.dev -t git-galaxy-frontend-dev services/frontend
docker run -p 8080:8080 -v $(pwd)/services/frontend/repo-constellation/src:/app/src -v $(pwd)/services/frontend/repo-constellation/public:/app/public git-galaxy-frontend-dev

# Or using npm directly (from repo-constellation directory)
cd services/frontend/repo-constellation
npm install
npm run dev
```

## Production

To build and run the frontend in production mode:

```bash
# Using Docker Compose
docker-compose -f docker-compose.prod.yml up frontend

# Or using Docker directly
docker build -f services/frontend/dev/Dockerfile -t git-galaxy-frontend services/frontend
docker run -p 8080:8080 git-galaxy-frontend
```

## Environment Variables

- `VITE_API_URL`: URL of the backend API (default: http://localhost:8000)

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Port

The frontend runs on port 8080 by default.
