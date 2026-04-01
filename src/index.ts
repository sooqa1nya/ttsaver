import 'dotenv/config';
import { Bot } from 'gramio';
import { start } from './handlers/start';
import { messages } from './handlers/messages';
import { inlineQuery } from './handlers/inline-query';
import { businessMessages } from './handlers/business-message';


export const bot = new Bot(process.env.BOT_TOKEN!)
    .extend(start)
    .extend(messages)
    .extend(inlineQuery)
    .extend(businessMessages)
    .onStart(() => console.log(`🤖 Бот запущен`));

bot.start();