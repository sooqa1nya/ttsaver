import { Composer } from 'gramio';
import { downloadSend } from '../tools/download-send';
import { searchLinks } from '../tools/search-links';
import { sendMessage } from '../services/telegram-api';

export const businessMessages = new Composer({ name: 'businessMessages' })
    .on("business_message", async context => {
        if (!context.hasText() || !context.hasFrom() || context.hasViaBot())
            return;

        const links = searchLinks(context.text);
        if (!links)
            return;

        for (const link of links) {
            try { await downloadSend(link, context.chat.id, context.businessConnectionId); }
            catch (e) {
                await sendMessage({
                    chat_id: process.env.CHAT_LOG!,
                    text: `Business message\n${e}\nUrl: ${link}`,
                    link_preview_options: { is_disabled: true }
                });
            }
        }
    });