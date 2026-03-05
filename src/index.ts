import 'dotenv/config';
import { Bot } from 'gramio';
import { handleMessages } from './handlers/messages';
import { mediaCache } from "@gramio/media-cache";
import { handleInlineQuery } from './handlers/inline-query';

export const bot = new Bot(process.env.BOT_TOKEN!)
    .extend(mediaCache())
    .hears(/https?:\/\//, handleMessages)
    .inlineQuery(/https?:\/\//, handleInlineQuery)
    .onStart(({ info }) => console.log(`Запущен как @${info.username}`));


bot.start();