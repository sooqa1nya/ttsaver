FROM node:26-bookworm-slim

ENV TZ="Europe/Moscow"

RUN apt-get update

RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    python3 \
    ffmpeg \
    && wget -q https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
        -O /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && apt-get purge -y --auto-remove wget \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/apt/*

WORKDIR /project
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "start"]
