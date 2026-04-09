import { Composer, InlineKeyboard, InlineQueryResult, InputMessageContent } from 'gramio';
import { searchLinks } from '../tools/search-links';
import { sendMessage } from '../services/telegram-api';
import { retryKeboard } from '../shared/keyboards';
import { urlData } from '../shared/callback-data';
import { inlineSend } from '../tools/inline-send';
import { payloadGenerate } from '../tools/ref-generate';
import { redis } from '../services/redis';


export const inlineQuery = new Composer({ name: 'inlineQuery' })
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
                            thumbnail_url: 'https://static.vecteezy.com/system/resources/previews/019/465/852/non_2x/tick-mark-icon-symbol-on-transparent-background-free-png.png',
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
                        {
                            thumbnail_url: 'https://static.vecteezy.com/system/resources/thumbnails/017/178/563/small/cross-check-icon-symbol-on-transparent-background-free-png.png'
                        }
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

            const payload = payloadGenerate();
            await redis.set(payload, context.query);
            await context.editText('💔 Failed to download media', {
                reply_markup: retryKeboard(payload, 1)
            });
        }
    })

    .callbackQuery(urlData, async context => {
        try {
            if (!context.inlineMessageId)
                throw new Error;

            const url = await redis.get(context.queryData.hash);
            if (!url)
                throw new Error('[InlineQuery] Url not found');

            await inlineSend(url, context.inlineMessageId);
        } catch (e) {
            const tryCount = context.queryData.c;

            await context.editText(`💔 Failed to download media${tryCount > 0 ? ` (#${tryCount + 1})` : ''}`, {
                reply_markup: retryKeboard(context.queryData.hash, tryCount + 1)
            });
        } finally {
            await context.answerCallbackQuery();
        }
    });