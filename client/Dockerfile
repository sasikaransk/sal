FROM node:20-alpine AS build
WORKDIR /client

COPY package*.json ./
RUN npm ci

COPY . .

# Correct Angular production build
RUN npm run build -- --configuration production

FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build client/dist/client /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
