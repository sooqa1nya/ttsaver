import { InputMedia, MediaSource, MessageContext, NextMiddleware } from 'puregram';

import { cobalt, supportREGEX } from '../cobalt-api';
import { localDownload, localUnlink } from '../local-download';
import { TelegramInputMediaPhoto } from 'puregram/generated';
import chunk from 'chunk';


export const messagesHandler = async (context: MessageContext, next: NextMiddleware) => {
    if (!context.hasText()) {
        return;
    }

    let downloadUrl = '';

    for (let i = 0; i < supportREGEX.length; i++) {
        const matches = context.text.match(supportREGEX[i]);
        if (!!matches) {
            downloadUrl = matches[0];
            break;
        }
    }


    if (!downloadUrl.length) {
        return await next();
    }

    if (!context.isPM()) {
        if (context.hasFrom()) {
            if (context.from.id == 650269699) {
                await context.delete();
            }
        }
    }

    const linksForDownload: Array<string> = [];
    const cobaltData = await cobalt(downloadUrl);

    if (!cobaltData) {
        await context.setReaction('💔');

        console.error(downloadUrl, cobaltData);
        await context.send('[ERROR] Downloader error (#1001)', { chat_id: <string>process.env.chatlog });

        return;
    }


    if (cobaltData.status == 'error') {
        await context.setReaction('💔');

        console.error(downloadUrl, cobaltData);
        await context.send('[ERROR] Downloader error (#1002)', { chat_id: <string>process.env.chatlog });

        return;
    } else if (cobaltData.status == 'picker') {
        for (let i = 0; i < cobaltData.picker.length; i++) {
            linksForDownload.push(cobaltData.picker[i].url);
        }
    } else if (
        cobaltData.status == 'tunnel'
        || cobaltData.status == 'redirect'
        || cobaltData.status == 'stream'
    ) {
        linksForDownload.push(cobaltData.url);
    }

    const ld = await localDownload(linksForDownload);

    try {
        let message: MessageContext | null = null;

        if (ld.extension == '.mp4') {
            message = await context.sendVideo(MediaSource.path(ld.directories[0]), { disable_notification: true });
        } else if (ld.extension == '.jpg') {
            const photos: Array<TelegramInputMediaPhoto> = [];
            photos.push(...ld.directories.map(dir => InputMedia.photo(MediaSource.path(dir))));

            const photosChunk = chunk(photos, 10);

            for (const photos of photosChunk) {
                await context.sendMediaGroup(photos, { disable_notification: true });
            }
        } else if (ld.extension == '.mp3') {
            message = await context.sendAudio(MediaSource.path(ld.directories[0]), { disable_notification: true });
        } else if (ld.extension == '.gif') {
            message = await context.sendAnimation(MediaSource.path(ld.directories[0]), { disable_notification: true });
        }

        if (!!message) {
            message.copy({ chat_id: process.env.chatlog });
        }
    } catch (e) {
        await context.setReaction('💔');
        console.error(downloadUrl, e);
        await context.send('[ERROR] Downloader error (#1003)', { chat_id: <string>process.env.chatlog });
    } finally {
        await localUnlink(ld.directories);
    }
};