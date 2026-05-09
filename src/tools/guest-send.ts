import { cobalt } from '../services/cobalt';
import { localDownload } from '../services/local-download';
import { redis } from '../services/redis';
import { sendAnimation, sendAudio, sendPhoto, sendVideo, sendMessage, answerGuestQuery } from '../services/telegram-api';
import { ttApiDl } from '../services/tiktok-api-dl';
import { tikwm } from '../services/tikwm';
import { showMoreKeyboard } from '../shared/keyboards';
import { IFile } from '../types/files';
import { payloadGenerate } from './ref-generate';


export const guestSend = async (link: string, guestQueryId: string) => {
    const chatId: string = process.env.CHAT_LOG!;

    const files: IFile[] = await cobalt.getFiles(link)
        .catch(async error => {
            console.warn('[GuestSend] ⚠️ Cobalt service failed, trying fallback services...');
            if (/tiktok/.test(link)) {
                return await ttApiDl.getFilesV1(link).catch(async () => {
                    return await ttApiDl.getFilesV3(link).catch(async () => {
                        return await tikwm.getFiles(link).catch(async () => {
                            return await ttApiDl.getFilesV2(link);
                        });
                    });
                });
            } else {
                const errorMsg = `[GuestSend] ❌ Cobalt failed and URL is not TikTok\n  Link: ${link}\n  Error: ${String(error)}`;
                console.error(errorMsg);
                throw new Error(errorMsg);
            }
        });

    if (!files.length) {
        const errorMsg = `[GuestSend] ❌ No media files retrieved from any service\n  Link: ${link}\n  GuestQueryId: ${guestQueryId}`;
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
            await answerGuestQuery({
                guest_query_id: guestQueryId,
                result: {
                    type: 'video',
                    video_url: message.video!.file_id,
                    thumbnail_url: message.video!.file_id,
                    id: new Date().getTime().toString(),
                    title: 'Video',
                    mime_type: 'video/mp4',
                    ...(files.length > 1 ? { reply_markup: showMoreKeyboard(payload) } : {})
                }
            });
        } else if (file.type === 'photo') {
            const message = await sendPhoto({ chat_id: chatId, photo: file.url });
            await answerGuestQuery({
                guest_query_id: guestQueryId,
                result: {
                    type: 'photo',
                    photo_url: message.photo![0].file_id,
                    thumbnail_url: message.photo![0].file_id,
                    id: new Date().getTime().toString(),
                    title: 'Photo',
                    ...(files.length > 1 ? { reply_markup: showMoreKeyboard(payload) } : {})
                }
            });
        } else if (file.type === 'audio') {
            const message = await sendAudio({ chat_id: chatId, audio: file.url });
            await answerGuestQuery({
                guest_query_id: guestQueryId,
                result: {
                    type: 'audio',
                    audio_url: message.audio!.file_id,
                    id: new Date().getTime().toString(),
                    title: 'Audio',
                    ...(files.length > 1 ? { reply_markup: showMoreKeyboard(payload) } : {})
                },
                ...(files.length > 1 ? { reply_markup: showMoreKeyboard(payload) } : {})
            });
        } else if (file.type === 'gif') {
            const message = await sendAnimation({ chat_id: chatId, animation: file.url });
            await answerGuestQuery({
                guest_query_id: guestQueryId,
                result: {
                    type: 'gif',
                    gif_url: message.animation!.file_id,
                    thumbnail_url: message.video!.file_id,
                    id: new Date().getTime().toString(),
                    title: 'GIF',
                    ...(files.length > 1 ? { reply_markup: showMoreKeyboard(payload) } : {})
                }
            });
        }

        if (files.length > 1) {
            await redis.set(payload, link);
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