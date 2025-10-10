# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Install all dependencies (including dev)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy compiled files
COPY --from=build /app/dist ./dist

USER node
EXPOSE 4000
CMD ["node", "dist/index.js"]
