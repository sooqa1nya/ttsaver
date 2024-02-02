import { TiktokDL } from '@tobyg74/tiktok-api-dl';
import { Telegram, MediaSource } from 'puregram';
import { TelegramInputMediaPhoto } from 'puregram/generated';
import chunk from 'chunk';
import cfg from './config/index.json';


export const telegram = new Telegram({
    token: cfg.botToken,
    apiRetryLimit: -1
});


telegram.updates.on('message', async (context, next) => {

    if (context.hasViaBot()) {
        return;
    }

    await next();

});

telegram.updates.on('message', async (context, next) => {

    if (!context.hasText()) {
        return;
    }

    if (!/https:\/\/(?:m|www|vm).tiktok.com\/.*\//.test(context.text)) {
        return;
    }


    const link_ctx: any = context.text.match(/(?<link>https:\/\/(?:m|www|vm).tiktok.com\/.*\/)/);


    await TiktokDL(link_ctx!.groups.link, {
        version: "v3"
    }).then(async (res: any) => {

        if (res.status === 'error') {
            await context.send(res.message);
            return;
        }


        switch (res.result.type) {

            case 'video':
                await context.sendVideo(MediaSource.url(res.result.video2));
                return;

            case 'image':
                let photos: Array<TelegramInputMediaPhoto> = [];

                for (let i = 0; i < res.result.images.length; i++) {

                    photos.push({
                        type: 'photo',
                        media: MediaSource.url(res.result.images[i])
                    });

                }


                for (const photo of chunk(photos, 10)) {
                    await context.sendMediaGroup(photo);
                }

                try {
                    await context.sendAudio(MediaSource.url(res.result.music));
                } catch { }

                return;

            default:
                await context.send('Формат не поддерживается: ' + res.result.type);
                return;

        }

    });


    await next();

});


telegram.updates
    .startPolling()
    .then(() => console.log('Бот запущен'))
    .catch(err => console.log('Ошибка запуска puregram:', err));