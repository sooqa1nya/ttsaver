import { Telegram } from 'puregram';
import 'dotenv/config';

import { local_isTemp } from './local-download';
import { isBot, tiktokHandler, youtubeHandler } from './handlers';


const telegram = new Telegram({
    token: process.env.botToken,
    apiRetryLimit: -1
});

// Отправлено ли сообщение ботом
telegram.updates.on('message', isBot);

// TikTok
telegram.updates.on('message', tiktokHandler);

// YouTube
telegram.updates.on('message', youtubeHandler);


telegram.updates
    .startPolling()
    .then(async () => {
        console.log('Бот запущен');
        await local_isTemp();
    })
    .catch(err => console.log('Ошибка запуска puregram:', err));