import { TiktokDL } from '@tobyg74/tiktok-api-dl';
import { Telegram, MediaSource } from 'puregram';
import { TelegramInputMediaPhoto } from 'puregram/generated';
import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import convert from 'heic-convert';
import { promisify } from 'util';
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

    // Получаем ссылка на загрузку файлов
    await TiktokDL(link_ctx!.groups.link, {
        version: "v1"
    }).then(async (res: any) => {

        if (res.status === 'error') {
            await context.send(res.message);
            return;
        }

        switch (res.result.type) {

            case 'video':

                await context.sendVideo(MediaSource.url(res.result.video[0]));
                return;

            case 'image':

                const folderName = new Date().getTime();
                fs.mkdirSync(path.join(__dirname, `/temp/${folderName}`));


                for (let i = 0; i < res.result.images.length; i++) {

                    const response = await axios.get(res.result.images[i], {
                        responseType: 'stream',
                    });

                    const format: any = res.result.images[0].match(/https:\/\/.*(?<format>.heic|.png|.jpg)/)!.groups!.format;
                    const directory = path.join(__dirname, `/temp/${folderName}/${i}${format}`);

                    const writer = fs.createWriteStream(directory);
                    await response.data.pipe(writer);

                }


                for (let i = 0; i < res.result.images.length; i++) {

                    const format: any = res.result.images[0].match(/https:\/\/.*(?<format>.heic|.png|.jpg)/)!.groups!.format;
                    const directory = path.join(__dirname, `/temp/${folderName}/${i}${format}`);

                    const outputBuffer: any = await convert({
                        buffer: await promisify(fs.readFile)(directory),
                        format: 'PNG'
                    });

                    await promisify(fs.writeFile)(path.join(__dirname, `/temp/${folderName}/${i}.png`), outputBuffer);

                }


                let photos: Array<TelegramInputMediaPhoto> = [];

                for (let i = 0; i < res.result.images.length; i++) {

                    photos.push({
                        type: 'photo',
                        media: MediaSource.path(path.join(__dirname, `/temp/${folderName}/${i}.png`))
                    });

                }


                for (const photo of chunk(photos, 10)) {
                    await context.sendMediaGroup(photo);
                }


                const files = fs.readdirSync(path.join(__dirname, `/temp/${folderName}`));

                for (const file of files) {
                    fs.unlinkSync(path.join(__dirname, `/temp/${folderName}/`) + file);
                }


                fs.rmdirSync(path.join(__dirname, `/temp/${folderName}`));

                return;

            default:
                context.send('Формат не поддерживается: ' + res.result.type);
                return;

        }

    });


    await next();

});


telegram.updates
    .startPolling()
    .then(() => console.log('Бот запущен'))
    .catch(err => console.log('Ошибка запуска puregram:', err));