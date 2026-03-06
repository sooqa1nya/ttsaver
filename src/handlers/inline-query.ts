import { Bot, ChosenInlineResultContext, InlineKeyboard, InlineQueryContext, InlineQueryResult, InputMessageContent } from 'gramio';
import { downloadSend } from '../tools/download-send';
import { searchLinks } from '../tools/search-links';


export const handleInlineQuery = async (context: InlineQueryContext<Bot>) => {
    try {
        const links = searchLinks(context.query);
        if (!links)
            throw new Error;

        await context.answer(
            [
                InlineQueryResult.article(
                    String(new Date().getTime()),
                    '👉 Click here',
                    InputMessageContent.text(
                        `⏳ Media download, expect...`
                    ),
                    {
                        reply_markup: new InlineKeyboard().url(
                            "💙 TikiToki Saver",
                            "https://t.me/bluesaverbot"
                        )
                    }
                )
            ]
        );
    } catch {
        await context.answer(
            [
                InlineQueryResult.article(
                    String(new Date().getTime() + 1),
                    '🔴 Please insert the link',
                    InputMessageContent.text(
                        `😔 The link is not supported or has been entered incorrectly`
                    ),
                )
            ]
        );
    }
};

export const handleChosenInlineQuery = async (context: ChosenInlineResultContext<Bot>) => {
    if (!context.inlineMessageId)
        return;

    try {
        await downloadSend(context.query, undefined, undefined, context.inlineMessageId);
    }
    catch (e) {
        await context.editText('💔 Failed to download video');
    }
};