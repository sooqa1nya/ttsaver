import { MediaSource, MessageContext, NextMiddleware } from 'puregram';
import { Downloader } from '@tobyg74/tiktok-api-dl';
import chunk from 'chunk';

import { local_download, local_unlink } from '../local-download';
import { TelegramInputMediaPhoto } from 'puregram/generated';


const REGEX = /(?<url>https?:\/\/(?:m|www|vm|vt).tiktok.com\/.*\/)/;

export const tiktokHandler = async (context: MessageContext, next: NextMiddleware) => {

    if (!context.hasText()) {
        return;
    }

    if (!REGEX.test(context.text)) {
        return await next();
    }


    const url_ctx = context.text.match(REGEX);

    await Downloader(url_ctx!.groups!.url, {
        version: "v1"
    }).then(async (output: any) => {

        if (output.status === 'error') {
            await context.send(output.message);
            return;
        }


        switch (output.result.type) {

            case 'video':

                let message: MessageContext;

                const result = output.result;
                const video = result.video.playAddr;

                try {
                    message = await context.sendVideo(MediaSource.url(video), { disable_notification: true });
                } catch {
                    const ld = await local_download([video], 'video');
                    try { message = await context.sendVideo(ld.media, { disable_notification: true }); }
                    catch { return await context.setReaction('💔'); }
                    finally { await local_unlink(ld.allDirectories); }
                }

                if (!message.hasAttachmentType('video')) {
                    return;
                }

                await context.sendVideo(MediaSource.fileId(message.attachment.fileId), { chat_id: process.env.chatlog, disable_notification: true });

                return;

            case 'image':
                let photos: Array<TelegramInputMediaPhoto> = [];

                for (let i = 0; i < output.result.images.length; i++) {

                    photos.push({
                        type: 'photo',
                        media: MediaSource.url(output.result.images[i])
                    });

                }

                const photosChunk = chunk(photos, 10);


                try {

                    for (const photos of photosChunk) {
                        await context.sendMediaGroup(photos, { disable_notification: true });
                    }

                } catch {
                    const ld = await local_download(output.result.images, 'photo');
                    try {
                        for (const photos of photosChunk) {
                            await context.sendMediaGroup(photos, { disable_notification: true });
                        }
                    }
                    catch { return await context.setReaction('💔'); }
                    finally { await local_unlink(ld.allDirectories); }
                }

                return;

            default:
                await context.send('Формат не поддерживается: ' + output.result.type);
                return;

        }

    });

};