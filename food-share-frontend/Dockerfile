# Multi-stage build for React frontend
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Pass backend URL at build time if needed
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV CI=false

RUN npm run build

# Nginx web server stage
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
