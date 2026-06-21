import { Composer, InlineQueryResult, InputMessageContent, InlineKeyboard } from 'gramio';
import { searchLinks } from '../tools/search-links';
import { sendMessage } from '../services/telegram-api';
import { guestSend } from '../tools/guest-send';
import { bot } from '../bot';


export const guestMessage = new Composer({ name: 'guestMessage' })
    .on('guest_message', async context => {
        if (!context.hasText() || !context.hasFrom() || context.hasViaBot()) {
            return;
        }

        let message;
        try {
            let links = searchLinks(context.text, true);
            if (!links && context.replyMessage?.text) {
                links = searchLinks(context.replyMessage.text, true);
            }


            if (!links) {
                const error = `[GuestMessage] ❌ No valid links found in guest query\n  Query: "${context.text}"\n  UserId: ${context.from?.id}`;
                console.error(error);
                throw new Error(error);
            }

            if (!context.guestQueryId) {
                const error = `[GuestMessage] ❌ Missing guestQueryId\n  Query: "${context.text}"\n  UserId: ${context.from?.id}`;
                console.error(error);
                throw new Error(error);
            }

            message = await context.answerGuestQuery(
                InlineQueryResult.article(
                    '1',
                    '⏳ Processing..',
                    InputMessageContent.text('Processing your request, please wait...'),
                    {
                        reply_markup: new InlineKeyboard().url('💙 TikiToki Saver', `https://t.me/bluesaverbot`),
                    }
                )
            );

            await guestSend(links[0], message.inline_message_id!);
        } catch (e) {
            if (message) {
                await bot.api.editMessageText({
                    text: '❌ Failed to process your request. Please try again later.',
                    inline_message_id: message.inline_message_id
                });
            }

            const errorMsg = `[GuestMessage] ❌ Failed to process guest message\n  Text: ${context.text}\n  UserId: ${context.from?.id}\n  Error: ${String(e)}`;
            console.error(errorMsg);
            await sendMessage({
                chat_id: process.env.CHAT_LOG!,
                text: `🔴 ChosenInlineResult Error\n${errorMsg}`,
                link_preview_options: { is_disabled: true }
            });
        }
    });