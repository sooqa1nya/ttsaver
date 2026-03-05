import { Bot, MessageContext } from 'gramio';
import { downloadSend } from '../tools/download-send';
import { searchLinks } from '../tools/search-links';


export const handleMessages = async (context: MessageContext<Bot>) => {
    if (!context.hasText() || !context.hasFrom() || context.hasViaBot())
        return;

    const links = searchLinks(context.text);
    if (!links)
        return;

    for (const link of links) {
        try { await downloadSend(link, context.chat.id); }
        catch (e) { await context.setReaction('💔'); }
    }
};