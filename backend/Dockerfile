FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build || echo "Sem build, seguindo..."

EXPOSE 3000

CMD ["npm", "start"]