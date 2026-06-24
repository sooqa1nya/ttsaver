FROM node:26-bookworm-slim

ENV TZ="Europe/Moscow"

RUN apt-get update

RUN apt-get install -y wget python3 \
    && wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /project
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "start"]