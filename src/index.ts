import { Telegram } from 'puregram';
import 'dotenv/config';

import { isTemp } from './isTemp';
import { inlineQueryHandler, messagesHandler } from './handlers';
import { isBot } from './handlers/isBot';


const telegram = new Telegram({
    token: process.env.botToken,
    apiRetryLimit: -1
});

telegram.updates.on('message', isBot);
telegram.updates.on('message', messagesHandler);
telegram.updates.on('inline_query', inlineQueryHandler);


telegram.updates
    .startPolling()
    .then(async () => {
        console.log('Бот запущен.');
        await isTemp();
    })
    .catch(err => console.log('Ошибка запуска puregram:', err));