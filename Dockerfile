FROM node:20.11-alpine

ENV TZ="Europe/Moscow"

WORKDIR /project
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "start"]