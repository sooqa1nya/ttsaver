import { TiktokDL } from '@tobyg74/tiktok-api-dl';
import { Telegram, MediaSource, MessageContext } from 'puregram';
import { TelegramInputMediaPhoto } from 'puregram/generated';
import chunk from 'chunk';
import ytdl from 'ytdl-core';
import { local_download, local_unlink, local_isTemp } from './local-download';
import 'dotenv/config';


const RegExp = {
    tiktok: /(?<url>https?:\/\/(?:m|www|vm|vt).tiktok.com\/.*\/)/,
    youtube: /(?<url>https?:\/\/(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$)))/
};


const telegram = new Telegram({
    token: process.env.botToken,
    apiRetryLimit: -1
});

// Отправлено ли сообщение ботом
telegram.updates.on('message', async (context, next) => {

    if (context.hasViaBot()) {
        return;
    }

    await next();

});

// TikTok
telegram.updates.on('message', async (context, next) => {

    if (!context.hasText()) {
        return;
    }


    if (RegExp.tiktok.test(context.text)) {

        const url_ctx = context.text.match(RegExp.tiktok);


        await TiktokDL(url_ctx!.groups!.url, {
            version: "v3"
        }).then(async (output: any) => {

            if (output.status === 'error') {
                await context.send(output.message);
                return;
            }


            switch (output.result.type) {

                case 'video':

                    let message: MessageContext;

                    try {
                        message = await context.sendVideo(MediaSource.url(output.result.video2), { disable_notification: true });
                    } catch {
                        const ld = await local_download([output.result.video2], 'video');
                        try { message = await context.sendVideo(ld.media); }
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
                            await context.sendMediaGroup(photos);
                        }

                    } catch {
                        const ld = await local_download([output.result.images], 'video');
                        try { message = await context.sendVideo(ld.media); }
                        catch { return await context.setReaction('💔'); }
                        finally { await local_unlink(ld.allDirectories); }
                    }

                    return;

                default:
                    await context.send('Формат не поддерживается: ' + output.result.type);
                    return;

            }

        });

    }


    await next();

});


// YouTube
telegram.updates.on('message', async (context, next) => {

    if (!context.hasText()) {
        return;
    }


    if (RegExp.youtube.test(context.text)) {

        const url_ctx = context.text.match(RegExp.youtube)!.groups!.url;


        const videoInfo = await ytdl.getInfo(url_ctx);
        const mp4Format = videoInfo.formats.filter(format => format.container === 'mp4');
        const audioPresent = mp4Format.filter(format => format.hasAudio === true);
        const videoPresent = audioPresent.filter(format => format.hasVideo === true);
        const bestQuality = videoPresent.sort((a, b) => {
            const aNum = parseInt(a.qualityLabel.split('p')[0]);
            const bNum = parseInt(b.qualityLabel.split('p')[0]);

            return bNum - aNum;
        });


        let message: MessageContext;

        try {
            message = await context.sendVideo(MediaSource.url(bestQuality[0].url), { disable_notification: true });
        } catch {
            const ld = await local_download([bestQuality[0].url], 'video');
            try { message = await context.sendVideo(ld.media); }
            catch { return await context.setReaction('💔'); }
            finally { await local_unlink(ld.allDirectories); }
        }

        if (!message.hasAttachmentType('video')) {
            return;
        }

        await context.sendVideo(MediaSource.fileId(message.attachment.fileId), { chat_id: process.env.chatlog, disable_notification: true });

        return;

    }


    await next();

});


telegram.updates
    .startPolling()
    .then(async () => {
        console.log('Бот запущен');
        await local_isTemp();
    })
    .catch(err => console.log('Ошибка запуска puregram:', err));