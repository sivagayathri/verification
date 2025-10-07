FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Compile TypeScript
RUN npm run build

# Use a non-root user
USER node

EXPOSE 4000

# Run the compiled JS
CMD ["node", "dist/index.js"]
