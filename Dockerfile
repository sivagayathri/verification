FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build # if you compile TS to JS; or use ts-node in prod only for dev

# Use a non-root user
USER node

EXPOSE 3000
CMD ["node", "dist/index.js"] # adjust to your built entry
