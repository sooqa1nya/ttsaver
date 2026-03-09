# 📥 TTSaver — Telegram Media Downloader Bot

Телеграм-бот для скачивания медиаконтента с популярных сервисов:

- 🎵 **TikTok**
- 🎬 **YouTube**
- 📸 **Instagram**
- 📘 **VK**
- 🎧 **SoundCloud**
- 📌 **Pinterest**
- 🐦 **Twitter (X)**
- 🎮 **Twitch Clips**

Поддержка личных сообщений, чатов, инлайн запросов, бизнес сообщений.

## Быстрый старт
Обязательно для полного функцианала! 
В настройках бота (BotFather) требуется включить: Inline mode -> Inline Feedback 100%, Business Mode.

1. Клонируем репозиторий и переходим в папку
```bash
git clone https://github.com/sooqa1nya/ttsaver && cd ttsaver
```

2. Копируем пример конфига
```bash
cp .env.example .env
```

3. Открываем файл для редактирования конфига (Оба параметра обязательны, токен бота и чат для логов. Бот должен быть добавлен в чат и получить разрешение на отправку сообщений)
```bash
nano .env
```

4. Первый запуск экзепляра (выполнять в папке с ботом)
```bash
docker compose build && docker compose up -d && docker compose logs -f
```
