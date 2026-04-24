import { Composer, Keyboard, type Bot, type MessageContext } from 'gramio';
import { redis } from '../services/redis';
import { searchLinks } from '../tools/search-links';
import { messageSend } from '../tools/message-send';
import { sendMessage } from '../services/telegram-api';


export const start = new Composer()
    .command('start', async context => {
        if (context.args && /\w+/.test(context.args)) {
            const link = await redis.get(context.args);
            if (!link) {
                return await context.send(`😔 The link was not found\nJust send me the link and I'll take care of everything 😏`);
            }

            try { await messageSend(link, context.chat.id); }
            catch (e) {
                const errorMsg = `[StartCommand] Media send error - ${String(e)}`;
                console.error(errorMsg, 'Link:', link);
                await sendMessage({
                    chat_id: process.env.CHAT_LOG!,
                    text: `🔴 Start message\n${errorMsg}\nUrl: ${link}`,
                    link_preview_options: { is_disabled: true }
                });
                await context.send('🚫 Media files could not be downloaded. Try sending the link to the bot.');
            }

            return;
        }

        const text = `
Welcome!
Just send me the link and I'll take care of everything 😏
`;

        await context.send(text, {
            reply_markup: new Keyboard()
                .text('ℹ️ Information', { style: 'primary' })
                .text('💳 Support project', { style: 'primary' })
        });
    })
    .hears('ℹ️ Information', async context => {
        const text = `
We are not responsible for content sent by the bot. The bot only downloads and sends videos via links sent by users.

Supported sites include: TikTok, YouTube Shorts, Instagram, Twitter (X), Twitch clips, Pinterest, SoundCloud, and VK video.

You can download media by sending a link to the bot's private messages. The bot also supports group chats (you need to give the bot permission to read and send messages). You can also download and send media within PM by writing: @bluesaverbot *link*

New!
The bot supports business mode. If you have Telegram Premium, you can connect it as a chat bot. After that, the bot will automatically search for supported links in the dialogue and send media. Permissions to read and send messages are required.

I developed the bot for free use, so you won't see any ads here (maybe 😁).
I also don't receive any money, so I would be very grateful for any support. You can get the details by clicking on the “💳 Support project” button.

Support: @blue_sup
`;

        await context.send(text, { parse_mode: 'HTML' });
    })
    .hears('💳 Support project', async context => {
        const text = `
💳 Support the author:
TRC20: <code>TWZ3XCLhNB4BRLMiQ2ftj5h4raK1uXneXP</code>
`;

        await context.send(text, { parse_mode: 'HTML' });
    });