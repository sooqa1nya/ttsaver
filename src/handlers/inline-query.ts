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
            if (!links) {
                const error = '[InlineQuery Handler] No links found for search query: ' + context.query;
                console.error(error);
                throw new Error(error);
            }

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
            const links = searchLinks(context.query, true);
            if (!links) {
                const error = '[InlineQuery Handler] No links found for search query: ' + context.query;
                console.error(error);
                throw new Error(error);
            }

            if (!context.inlineMessageId) {
                const error = '[ChosenInlineResult] Missing inlineMessageId for query: ' + context.query;
                console.error(error);
                throw new Error(error);
            }

            await inlineSend(links[0], context.inlineMessageId);
        } catch (e) {
            const errorMsg = `[ChosenInlineResult] Error: ${String(e)}\nUrl: ${context.query}`;
            console.error(errorMsg);
            await sendMessage({
                chat_id: process.env.CHAT_LOG!,
                text: `🔴 ChosenInlineResult Error\n${errorMsg}`,
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
            if (!context.inlineMessageId) {
                const error = '[CallbackQuery] Missing inlineMessageId for hash: ' + context.queryData.hash;
                console.error(error);
                throw new Error(error);
            }

            const url = await redis.get(context.queryData.hash);
            if (!url) {
                const error = '[CallbackQuery] Redis - URL not found for hash: ' + context.queryData.hash;
                console.error(error);
                throw new Error(error);
            }

            await inlineSend(url, context.inlineMessageId);
        } catch (e) {
            const tryCount = context.queryData.c;
            const errorMsg = `[CallbackQuery] Error on retry #${tryCount}: ${String(e)}`;
            console.error(errorMsg);

            await context.editText(`💔 Failed to download media${tryCount > 0 ? ` (#${tryCount + 1})` : ''}`, {
                reply_markup: retryKeboard(context.queryData.hash, tryCount + 1)
            });
        } finally {
            await context.answerCallbackQuery();
        }
    });