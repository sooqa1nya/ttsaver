import { cobalt } from '../services/cobalt';
import { localDownload } from '../services/local-download';
import { redis } from '../services/redis';
import { editMedia, sendAnimation, sendAudio, sendPhoto, sendVideo, sendMessage } from '../services/telegram-api';
import { ttApiDl } from '../services/tiktok-api-dl';
import { showMoreKeyboard } from '../shared/keyboards';
import { IFile } from '../types/files';
import { payloadGenerate } from './ref-generate';


export const inlineSend = async (link: string, inlineMessageId: string) => {
    const chatId: string = process.env.CHAT_LOG!;

    const files: IFile[] = await cobalt.getFiles(link)
        .catch(async error => {
            if (/tiktok/.test(link)) {
                return await ttApiDl.getFilesV1(link).catch(async () => {
                    return await ttApiDl.getFilesV3(link);
                });
            } else {
                const errorMsg = '[InlineSend] Cobalt failed and URL is not TikTok: ' + String(error);
                console.error(errorMsg);
                throw new Error(errorMsg);
            }
        });

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