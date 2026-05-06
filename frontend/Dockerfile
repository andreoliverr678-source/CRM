# Build stage
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build || echo "Build falhou ou não necessário"

# Serve stage
FROM nginx:alpine

# Copia build
COPY --from=build /app/dist /usr/share/nginx/html

# Config nginx (opcional, mas recomendado)
COPY nginx.conf /etc/nginx/conf.d/default.conf || true

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]