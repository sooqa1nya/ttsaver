FROM node:26-bookworm

ENV TZ="Europe/Moscow"

RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /project
COPY package*.json ./
RUN npm install
COPY . .

CMD ["sh", "-c", "npm start"]
