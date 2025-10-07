FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Compile TypeScript
RUN npm run build

USER node
EXPOSE 4000

CMD ["node", "dist/index.js"]
