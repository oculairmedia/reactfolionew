# Dockerfile for Payload CMS Backend

# Use Node.js LTS version
FROM node:18-alpine AS base

# Install dependencies for building native modules
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.server.json ./

# Install dependencies (using install instead of ci to respect overrides)
RUN npm install --legacy-peer-deps

# Copy Payload configuration and server
COPY payload ./payload
COPY payload.config.ts ./
COPY payload.config.js ./
COPY server.ts ./

# Build TypeScript
RUN npm run payload:build

# Production stage
FROM node:18-alpine AS production

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm install --legacy-peer-deps --only=production

# Copy built files from base stage
COPY --from=base /app/dist ./dist
COPY --from=base /app/payload ./payload
COPY --from=base /app/payload.config.js ./payload.config.js

# Create media directory
RUN mkdir -p media && chown -R node:node media

# Switch to non-root user
USER node

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/access/me', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "dist/server.js"]
