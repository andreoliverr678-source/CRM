# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Embed the API URL at build time (Vite bakes this into the static bundle)
# Default value ensures EasyPanel/CI builds work without --build-arg
ARG VITE_API_URL=https://agente-backend.amxxqr.easypanel.host/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Serve stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]