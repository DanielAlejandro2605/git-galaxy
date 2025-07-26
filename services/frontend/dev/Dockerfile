# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY ../repo-constellation/package*.json ./
COPY ../repo-constellation/bun.lockb ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY ../repo-constellation/ .

# Build the application
RUN npm run build

# Install serve to run the built application
RUN npm install -g serve

# Expose port
EXPOSE 8080

# Start the application
CMD ["serve", "-s", "dist", "-l", "8080"] 