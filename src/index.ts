import 'dotenv/config';
import { Bot } from 'gramio';
import { start } from './handlers/start';
import { messages } from './handlers/messages';
import { inlineQuery } from './handlers/inline-query';
import { businessMessages } from './handlers/business-message';
import { cache } from './plugin/mediaCache';


export const bot = new Bot(process.env.BOT_TOKEN!)
    .extend(cache)
    .extend(start)
    .extend(messages)
    .extend(inlineQuery)
    .extend(businessMessages)
    .onStart(() => console.log(`🤖 Бот запущен`));

bot.start();