FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV PORT=3000

EXPOSE 3000

# instala wget pro healthcheck funcionar
RUN apk add --no-cache wget

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
    CMD wget -qO- http://localhost:3000 || exit 1

CMD ["node", "index.js"]