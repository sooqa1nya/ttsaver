FROM node:26-bookworm-slim

ENV TZ="Europe/Moscow"

RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    python3 \
    ffmpeg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /project
COPY package*.json ./
RUN npm install
COPY . .

CMD ["sh", "-c", "yt-dlp -U && npm start"]
