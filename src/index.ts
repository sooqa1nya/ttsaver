import 'dotenv/config';
import { Bot } from 'gramio';
import { handleMessages } from './handlers/messages';


export const bot = new Bot(process.env.BOT_TOKEN!)
    .hears(/https?:\/\//, handleMessages)
    .onStart(({ info }) => console.log(`Запущен как @${info.username}`))
    .start();