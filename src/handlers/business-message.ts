import { Composer } from 'gramio';
import { searchLinks } from '../tools/search-links';
import { sendMessage } from '../services/telegram-api';
import { messageSend } from '../tools/message-send';
import { emptyKeyboard, infoBMKeyboard } from '../shared/keyboards';


export const businessMessages = new Composer({ name: 'businessMessages' })
    .on("business_message", async context => {
        if (!context.hasText() || !context.hasFrom() || context.hasViaBot())
            return;

        const links = searchLinks(context.text);
        if (!links)
            return;

        if (context.chat.id != context.from.id) await context.editReplyMarkup(infoBMKeyboard('⏳ Processing...'));
        for (const link of links) {
            try {
                await messageSend(link, context.chat.id, context.businessConnectionId);
                try {
                    if (context.chat.id != context.from.id) await context.editReplyMarkup(emptyKeyboard);
                } catch (e) {
                    const errorMsg = `[BusinessMessage] Failed to remove button - ${String(e)}`;
                    console.error(errorMsg);
                    await sendMessage({
                        chat_id: process.env.CHAT_LOG!,
                        text: `🔴 Business message | REMOVE BUTTON\n${errorMsg}\nUrl: ${link}`,
                        link_preview_options: { is_disabled: true }
                    });
                }
            }
            catch (e) {
                const errorMsg = `[BusinessMessage] Media send error - ${String(e)}`;
                console.error(errorMsg, 'Link:', link);
                await sendMessage({
                    chat_id: process.env.CHAT_LOG!,
                    text: `🔴 Business message\n${errorMsg}\nUrl: ${link}`,
                    link_preview_options: { is_disabled: true }
                });
                try {
                    if (context.chat.id != context.from.id) await context.editReplyMarkup(infoBMKeyboard('😔 Download error'));
                } catch (e) {
                    const errorMsg = `[BusinessMessage] Failed to add error button - ${String(e)}`;
                    console.error(errorMsg);
                    await sendMessage({
                        chat_id: process.env.CHAT_LOG!,
                        text: `🔴 Business message | ADD ERROR BUTTON\n${errorMsg}\nUrl: ${link}`,
                        link_preview_options: { is_disabled: true }
                    });
                }
            }
        }
    });