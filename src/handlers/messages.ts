import { Bot, MessageContext } from 'gramio';
import { downloadSend } from '../tools/download-send';
import { searchLinks } from '../tools/search-links';
import { sendMessage } from '../services/telegram-api';


export const handleMessages = async (context: MessageContext<Bot>) => {
    if (!context.hasText() || !context.hasFrom() || context.hasViaBot())
        return;

    const links = searchLinks(context.text);
    if (!links)
        return;

    for (const link of links) {
        try { await downloadSend(link, context.chat.id); }
        catch (e) {
            await sendMessage({
                chat_id: process.env.CHAT_LOG!,
                text: `Messages\n${e}\nUrl: ${link}`
            });
            await context.setReaction('💔');
        }
    }
};