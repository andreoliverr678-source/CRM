FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV PORT=3000

EXPOSE 3000

RUN apk add --no-cache curl

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
    CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "index.js"]