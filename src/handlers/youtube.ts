import { MediaSource, MessageContext, NextMiddleware } from 'puregram';
import ytdl from 'ytdl-core';

import { local_download, local_unlink } from '../local-download';

const REGEXP = /(?<url>https?:\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]+)(?:\?.*)?|https?:\/\/(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts)(.*?((?=[&#?])|$)))/;


export const youtubeHandler = async (context: MessageContext, next: NextMiddleware) => {

    if (!context.hasText()) {
        return;
    }

    if (!REGEXP.test(context.text)) {
        return await next();
    }


    const url_ctx = context.text.match(REGEXP)!.groups!.url;


    const videoInfo = await ytdl.getInfo(url_ctx);
    const bestQuality = videoInfo.formats.filter(
        format =>
            format.container === 'mp4' &&
            format.hasAudio === true &&
            format.hasVideo === true
    ).sort((a, b) => {
        const aNum = parseInt(a.qualityLabel.split('p')[0]);
        const bNum = parseInt(b.qualityLabel.split('p')[0]);

        return bNum - aNum;
    });


    let message: MessageContext;

    try {
        message = await context.sendVideo(MediaSource.url(bestQuality[0].url), { disable_notification: true });
    } catch {
        const ld = await local_download([bestQuality[0].url], 'video');
        try { message = await context.sendVideo(ld.media, { disable_notification: true }); }
        catch { return await context.setReaction('💔'); }
        finally { await local_unlink(ld.allDirectories); }
    }

    if (!message.hasAttachmentType('video')) {
        return;
    }

    await context.sendVideo(MediaSource.fileId(message.attachment.fileId), { chat_id: process.env.chatlog, disable_notification: true });

};