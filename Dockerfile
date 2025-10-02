# Development Dockerfile for Docker Compose
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server with external host binding
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]