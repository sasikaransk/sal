# -----------------------------
# 1) Build Angular App
# -----------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json & lock files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Angular (production)
RUN npm run build --configuration production


# -----------------------------
# 2) Serve with Nginx
# -----------------------------
FROM nginx:stable-alpine AS serve

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy Angular dist output
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
