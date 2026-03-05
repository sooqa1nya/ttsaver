FROM node:current-alpine3.22  

ENV TZ="Europe/Moscow"

WORKDIR /project
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "start"]