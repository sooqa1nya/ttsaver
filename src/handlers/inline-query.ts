import { Bot, InlineQueryContext } from 'gramio';
import { downloadSend } from '../tools/download-send';
import { searchLinks } from '../tools/search-links';


export const handleInlineQuery = async (context: InlineQueryContext<Bot>) => {
    const links = searchLinks(context.query);
    if (!links)
        return;

    for (const link of links) {
        try { await downloadSend(link); } //dev)
        catch (e) { }
    }
};