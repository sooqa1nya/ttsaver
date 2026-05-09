import { Composer } from 'gramio';
import { searchLinks } from '../tools/search-links';
import { sendMessage } from '../services/telegram-api';
import { guestSend } from '../tools/guest-send';


export const guestMessage = new Composer({ name: 'guestMessage' })
    .on('guest_message', async context => {
        if (!context.hasText() || !context.hasFrom() || context.hasViaBot()) {
            return;
        }

        try {
            const links = searchLinks(context.text, true);
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

            await guestSend(links[0], context.guestQueryId);
        } catch (e) {
            const errorMsg = `[GuestMessage] ❌ Failed to process guest message\n  Text: ${context.text}\n  UserId: ${context.from?.id}\n  Error: ${String(e)}`;
            console.error(errorMsg);
            await sendMessage({
                chat_id: process.env.CHAT_LOG!,
                text: `🔴 ChosenInlineResult Error\n${errorMsg}`,
                link_preview_options: { is_disabled: true }
            });
        }
    });