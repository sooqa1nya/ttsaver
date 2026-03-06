import 'dotenv/config';
import { Bot } from 'gramio';
import { handleMessages } from './handlers/messages';
import { mediaCache } from "@gramio/media-cache";
import { handleChosenInlineQuery, handleInlineQuery } from './handlers/inline-query';
import { handleBusinessMessages } from './handlers/business-message';
import { start } from './handlers/start';

export const bot = new Bot(process.env.BOT_TOKEN!)
    .extend(mediaCache())
    .extend(start)
    .hears(/https?:\/\//, handleMessages)
    .inlineQuery(/.*/, handleInlineQuery)
    .chosenInlineResult(/.*/, handleChosenInlineQuery)
    .on("business_message", handleBusinessMessages)
    .onStart(() => console.log(`🤖 Бот запущен`));

bot.start();