import { Bot } from 'gramio';
import { start } from './handlers/start';
import { messages } from './handlers/messages';
import { inlineQuery } from './handlers/inline-query';
import { businessMessages } from './handlers/business-message';
import { cache } from './plugin/mediaCache';
import { service } from './handlers/service';
import { guestMessage } from './handlers/guest-message';


export const bot = new Bot(process.env.BOT_TOKEN!)
    .extend(cache)
    .extend(start)
    .extend(messages)
    .extend(inlineQuery)
    .extend(businessMessages)
    .extend(service)
    .extend(guestMessage)
    .onStart(
        ({ plugins }) => {
            console.log(`🤖 Бот запущен`);
            console.log(`Список плагинов: ${plugins.join(", ")}`);
        }
    );