import { Composer } from 'gramio';
import { searchLinks } from '../tools/search-links';
import { sendMessage } from '../services/telegram-api';
import { messageSend } from '../tools/message-send';


export const messages = new Composer({ name: 'messages' })
    .hears(/https?:\/\//, async context => {
        if (!context.hasText() || !context.hasFrom() || context.hasViaBot())
            return;

        const links = searchLinks(context.text);
        if (!links)
            return;

        for (const link of links) {
            try { await messageSend(link, context.chat.id); }
            catch (e) {
                const errorMsg = `[Messages] Media send error - ${String(e)}`;
                console.error(errorMsg, 'Link:', link);
                await sendMessage({
                    chat_id: process.env.CHAT_LOG!,
                    text: `🔴 Messages\n${errorMsg}\nUrl: ${link}`,
                    link_preview_options: { is_disabled: true }
                });
                await context.setReaction('💔');
            }
        }
    });