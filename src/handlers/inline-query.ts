import { Composer, InlineKeyboard, InlineQueryResult, InputMessageContent } from 'gramio';
import { searchLinks } from '../tools/search-links';
import { sendMessage } from '../services/telegram-api';
import { cache } from '../plugin/mediaCache';
import { retryKeboard } from '../shared/keyboards';
import { urlData } from '../shared/callback-data';
import { inlineSend } from '../tools/inline-send';


export const inlineQuery = new Composer({ name: 'inlineQuery' })
    .extend(cache)
    .inlineQuery(/.*/, async context => {
        try {
            const links = searchLinks(context.query, true);
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
        try {
            if (!context.inlineMessageId)
                throw new Error;

            await inlineSend(context.query, context.inlineMessageId);
        } catch (e) {
            await sendMessage({
                chat_id: process.env.CHAT_LOG!,
                text: `InlineQuery\n${e}\nUrl: ${context.query}`,
                link_preview_options: { is_disabled: true }
            });
            await context.editText('💔 Failed to download media', {
                reply_markup: retryKeboard(context.query, 1)
            });
        }
    })

    .callbackQuery(urlData, async context => {
        try {
            if (!context.inlineMessageId)
                throw new Error;

            await inlineSend(context.queryData.url, context.inlineMessageId);
        } catch (e) {
            const tryCount = context.queryData.c;

            await context.editText(`💔 Failed to download media${tryCount > 0 ? ` (#${tryCount + 1})` : ''}`, {
                reply_markup: retryKeboard(context.queryData.url, tryCount + 1)
            });
        } finally {
            await context.answerCallbackQuery();
        }
    });