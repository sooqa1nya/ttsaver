import { Composer, InlineKeyboard, InlineQueryResult, InputMessageContent } from 'gramio';
import { downloadSend } from '../tools/download-send';
import { searchLinks } from '../tools/search-links';
import { sendMessage } from '../services/telegram-api';
import { cache } from '../plugin/mediaCache';


export const inlineQuery = new Composer({ name: 'inlineQuery' })
    .extend(cache)
    .inlineQuery(/.*/, async context => {
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
                        String(new Date().getTime()),
                        '🔴 Please insert the link',
                        InputMessageContent.text(
                            `😔 The link is not supported or has been entered incorrectly`
                        ),
                    )
                ]
            );
        }
    })

    .chosenInlineResult(/.*/, async context => {
        if (!context.inlineMessageId)
            return;

        try {
            await downloadSend(context.query, undefined, undefined, context.inlineMessageId);
        }
        catch (e) {
            await sendMessage({
                chat_id: process.env.CHAT_LOG!,
                text: `InlineQuery\n${e}\nUrl: ${context.query}`,
                link_preview_options: { is_disabled: true }
            });
            await context.editText('💔 Failed to download video');
        }
    });