FROM node:18-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy backend source
COPY . .

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]
