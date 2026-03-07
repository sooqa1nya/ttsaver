import { MediaInput, MediaUpload, TelegramMessage, TelegramParams } from 'gramio';
import { cobalt } from '../services/cobalt';
import { localDownload } from '../services/local-download';
import { editMedia, sendAnimation, sendAudio, sendMediaGroup, sendPhoto, sendVideo } from '../services/telegram-api';
import { chunk } from './chunk';


export const downloadSend = async (link: string, chatId: string | number = process.env.CHAT_LOG!, businessId: string | undefined = undefined, inlineMessageId?: string) => {
    let files: {
        type: 'video' | 'photo' | 'gif' | 'audio';
        format: 'url' | 'path';
        file: string;
        id?: string;
    }[] = [];
    let mediaGroup: TelegramParams.SendMediaGroupParams['media'] = [];

    try {
        const download = await cobalt.download(link);

        if (download.status === 'redirect') {
            files.push({
                type: await cobalt.getFileType(download.filename),
                format: 'url',
                file: download.url
            });
        } else if (download.status === 'tunnel') {
            files.push({
                type: await cobalt.getFileType(download.filename),
                format: 'path',
                file: await localDownload.download(download.url, Math.floor(Math.random() * 100000).toString() + download.filename)
            });
        } else if (download.status === 'picker') {
            for (const element of download.picker) {
                files.push({
                    type: element.type,
                    format: /http:\/\/cobalt-api:9000/.test(element.url) ? 'path' : 'url',
                    file: element.url
                });
            }
        }


        for (const file of files) {
            const mediaFile: File = file.format === 'url' ? await MediaUpload.url(file.file) : await MediaUpload.path(file.file);

            if (file.type === 'video') {
                if (!!inlineMessageId) {
                    if (!mediaFile)
                        throw new Error('FILE EMPTY' + mediaFile);

                    const message = await sendVideo({ business_connection_id: businessId, chat_id: chatId, video: mediaFile });
                    await editMedia({
                        inline_message_id: inlineMessageId,
                        media: {
                            type: 'video',
                            media: message.video!.file_id
                        }
                    });
                    return;
                }

                mediaGroup.push(
                    MediaInput.video(mediaFile)
                );
            } else if (file.type === 'photo') {
                if (!!inlineMessageId) {
                    const message = await sendPhoto({ business_connection_id: businessId, chat_id: chatId, photo: mediaFile });
                    await editMedia({
                        inline_message_id: inlineMessageId,
                        media: {
                            type: 'photo',
                            media: message.photo![0].file_id
                        }
                    });
                    return;
                }

                mediaGroup.push(
                    MediaInput.photo(mediaFile)
                );
            } else if (file.type === 'audio') {
                if (!!inlineMessageId) {
                    const message = await sendAudio({ business_connection_id: businessId, chat_id: chatId, audio: mediaFile });
                    await editMedia({
                        inline_message_id: inlineMessageId,
                        media: {
                            type: 'audio',
                            media: message.audio!.file_id
                        }
                    });
                    return;
                }

                mediaGroup.push(
                    MediaInput.audio(mediaFile)
                );
            } else if (file.type === 'gif') {
                const message = await sendAnimation({ business_connection_id: businessId, chat_id: chatId, animation: mediaFile });

                if (!!inlineMessageId) {
                    await editMedia({
                        inline_message_id: inlineMessageId,
                        media: {
                            type: 'animation',
                            media: message.animation!.file_id
                        }
                    });
                    return;
                }
            }
        }

        let message: TelegramMessage[];

        const mediaChunk = chunk(mediaGroup, 10);
        for (const media of mediaChunk) {
            message = await sendMediaGroup({ business_connection_id: businessId, chat_id: chatId, media });
        }
    } finally {
        files
            .filter(x => x.format === 'path')
            .forEach(x => localDownload.removeFile(x.file));
    }
};