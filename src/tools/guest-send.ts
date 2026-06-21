import { cobalt } from '../services/cobalt';
import { localDownload } from '../services/local-download';
import { redis } from '../services/redis';
import { sendAnimation, sendAudio, sendPhoto, sendVideo, sendMessage, answerGuestQuery, editMedia } from '../services/telegram-api';
import { ttApiDl } from '../services/tiktok-api-dl';
import { tikwm } from '../services/tikwm';
import { showMoreKeyboard } from '../shared/keyboards';
import { IFile } from '../types/files';
import { payloadGenerate } from './ref-generate';


const main = async (files: IFile[], link: string, inlineMessageId: string) => {
    const chatId: string = process.env.CHAT_LOG!;

    if (!files.length) {
        const errorMsg = `[GuestSend] ❌ No media files retrieved from any service\n  Link: ${link}\n  inlineMessageId: ${inlineMessageId}`;
        console.error(errorMsg);
        await sendMessage({
            chat_id: process.env.CHAT_LOG!,
            text: `🔴 GuestSend: No media files retrieved\n${errorMsg}`,
            link_preview_options: { is_disabled: true }
        });
        throw new Error(errorMsg);
    }
    const file = files[0];
    const payload = payloadGenerate();

    try {
        if (file.type === 'video') {
            const message = await sendVideo({ chat_id: chatId, video: file.url });
            await editMedia({
                inline_message_id: inlineMessageId,
                media: {
                    type: 'video',
                    media: message.video!.file_id
                },
                ...(files.length > 1 ? { reply_markup: showMoreKeyboard(payload) } : {})
            });
        } else if (file.type === 'photo') {
            const message = await sendPhoto({ chat_id: chatId, photo: file.url });
            await editMedia({
                inline_message_id: inlineMessageId,
                media: {
                    type: 'photo',
                    media: message.photo![0].file_id
                },
                ...(files.length > 1 ? { reply_markup: showMoreKeyboard(payload) } : {})
            });
        } else if (file.type === 'audio') {
            const message = await sendAudio({ chat_id: chatId, audio: file.url });
            await editMedia({
                inline_message_id: inlineMessageId,
                media: {
                    type: 'audio',
                    media: message.audio!.file_id
                },
                ...(files.length > 1 ? { reply_markup: showMoreKeyboard(payload) } : {})
            });
        } else if (file.type === 'gif') {
            const message = await sendAnimation({ chat_id: chatId, animation: file.url });
            await editMedia({
                inline_message_id: inlineMessageId,
                media: {
                    type: 'animation',
                    media: message.animation!.file_id
                },
                ...(files.length > 1 ? { reply_markup: showMoreKeyboard(payload) } : {})
            });
        }

        if (files.length > 1) {
            console.log('set link');
            await redis.set(payload, link);
            console.log('true');
        }

    } catch (error) {
        const errorMsg = `[GuestSend] ❌ Failed to send media via Telegram API\n  Link: ${link}\n  FileType: ${file.type}\n  Error: ${String(error)}`;
        console.error(errorMsg);
        await sendMessage({
            chat_id: process.env.CHAT_LOG!,
            text: `🔴 GuestSend: Media send error\n${errorMsg}`,
            link_preview_options: { is_disabled: true }
        });
        throw new Error(errorMsg);
    } finally {
        files.forEach(x => {
            if (x.remove) {
                localDownload.removeFile(x.remove);
            }
        });
    }
};

export const guestSend = async (link: string, inlineMessageId: string) => {
    const isTikTok = /tiktok/.test(link);

    const methods = [
        () => cobalt.getFiles(link),
        ...(isTikTok ? [
            () => ttApiDl.getFilesV1(link),
            () => ttApiDl.getFilesV2(link),
            () => ttApiDl.getFilesV3(link),
            () => tikwm.getFiles(link)
        ] : [])
    ];

    let lastError: Error | undefined;

    for (const getFiles of methods) {
        try {
            const files = await getFiles();
            await main(files, link, inlineMessageId);
            return;
        } catch (error) {
            lastError = error as Error;
        }
    }

    const errorMsg = lastError
        ? `[GuestSend] All methods failed. Last error: ${String(lastError)}`
        : '[GuestSend] No methods available for this URL';
    console.error(errorMsg);
    throw new Error(errorMsg);
};