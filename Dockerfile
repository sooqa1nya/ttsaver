FROM node:26-bookworm-slim

ENV TZ="Europe/Moscow"

WORKDIR /project
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "start"]