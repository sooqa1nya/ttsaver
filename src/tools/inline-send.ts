import { cobalt } from '../services/cobalt';
import { localDownload } from '../services/local-download';
import { redis } from '../services/redis';
import { editMedia, sendAnimation, sendAudio, sendPhoto, sendVideo, sendMessage } from '../services/telegram-api';
import { ttApiDl } from '../services/tiktok-api-dl';
import { tikwm } from '../services/tikwm';
import { showMoreKeyboard } from '../shared/keyboards';
import { IFile } from '../types/files';
import { getMethods } from './get-methods';
import { payloadGenerate } from './ref-generate';


const main = async (files: IFile[], link: string, inlineMessageId: string) => {
    const chatId: string = process.env.CHAT_LOG!;

    if (!files.length) {
        const errorMsg = '[InlineSend] No media files retrieved from any service for URL: ' + link;
        console.error(errorMsg);
        await sendMessage({
            chat_id: process.env.CHAT_LOG!,
            text: `🔴 InlineSend Error\n${errorMsg}`,
            link_preview_options: { is_disabled: true }
        });
        throw new Error(errorMsg);
    }
    const file = files[0];
    const payload = payloadGenerate();

    try {
        if (file.type === 'video') {
            const message = await sendVideo({ chat_id: chatId, video: file.url });
            if (message.video) {
                await redis.set(link, message.video.file_id, 259200);
            }

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
            await redis.set(payload, link);
        }

    } catch (error) {
        const errorMsg = '[InlineSend] Failed to edit/send media - ' + String(error);
        console.error(errorMsg);
        await sendMessage({
            chat_id: process.env.CHAT_LOG!,
            text: `🔴 InlineSend Media Send Error\n${errorMsg}\nLink: ${link}`,
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

export const inlineSend = async (link: string, inlineMessageId: string) => {
    let lastError: Error | undefined;

    try {
        const cachedFileId = await redis.get(link);
        if (cachedFileId) {
            await editMedia({
                inline_message_id: inlineMessageId,
                media: {
                    type: 'video',
                    media: cachedFileId
                }
            });
            return;
        }
    } catch { }

    for (const getFiles of getMethods(link)) {
        try {
            const files = await getFiles();
            await main(files, link, inlineMessageId);
            return;
        } catch (error) {
            lastError = error as Error;
        }
    }

    const errorMsg = lastError
        ? `[InlineSend] All methods failed. Last error: ${String(lastError)}`
        : '[InlineSend] No methods available for this URL';
    console.error(errorMsg);
    throw new Error(errorMsg);
};