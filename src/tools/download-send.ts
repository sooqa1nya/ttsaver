import { MediaInput, MediaUpload, TelegramMessage, TelegramParams } from 'gramio';
import { cobalt } from '../services/cobalt';
import { localDownload } from '../services/local-download';
import { sendAnimation, sendMediaGroup } from '../services/telegram-api';


export const downloadSend = async (link: string, chatId: string | number = process.env.CHAT_LOG!) => {
    let files: {
        type: 'video' | 'photo' | 'gif' | 'audio';
        format: 'url' | 'path';
        file: string;
        id?: string;
    }[] = [];
    let mediaGroup: TelegramParams.SendMediaGroupParams["media"] = [];

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
                file: await localDownload.download(download.url, download.filename)
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
                mediaGroup.push(
                    MediaInput.video(mediaFile)
                );
            } else if (file.type === 'photo') {
                mediaGroup.push(
                    MediaInput.photo(mediaFile)
                );
            } else if (file.type === 'audio') {
                mediaGroup.push(
                    MediaInput.audio(mediaFile)
                );
            } else if (file.type === 'gif') {
                await sendAnimation({ chat_id: chatId, animation: mediaFile });
            }

            if (!(mediaGroup.length % 10) || mediaGroup.length === files.length) {
                await sendMediaGroup({ chat_id: chatId, media: mediaGroup });
                mediaGroup = [];
            }
        }
    } finally {
        files
            .filter(x => x.format === 'path')
            .forEach(x => localDownload.removeFile(x.file));
    }
};