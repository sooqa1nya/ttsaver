import { MediaInput, TelegramParams } from 'gramio';
import { localDownload } from '../services/local-download';
import { sendAnimation, sendAudio, sendMediaGroup, sendPhoto, sendVideo } from '../services/telegram-api';
import { chunk } from './chunk';
import { IFile } from '../types/files';
import { ytdl } from '../services/yt-dl';
import { ttApiDl } from '../services/tiktok-api-dl';
import { cobalt } from '../services/cobalt';
import { tikwm } from '../services/tikwm';


const main = async (files: IFile[], link: string, chatId: string | number, businessId: string | undefined = undefined) => {
    if (!files.length) {
        const errorMsg = '[MessageSend] No media files retrieved from any service for URL: ' + link;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    try {
        let mediaGroup: TelegramParams.SendMediaGroupParams['media'] = [];
        for (const file of files) {
            if (file.type === 'video') {
                if (files.length === 1) {
                    await sendVideo({ business_connection_id: businessId, chat_id: chatId, video: file.url });
                    return;
                }

                mediaGroup.push(
                    MediaInput.video(file.url)
                );
            } else if (file.type === 'photo') {
                if (files.length === 1) {
                    await sendPhoto({ business_connection_id: businessId, chat_id: chatId, photo: file.url });
                    return;
                }

                mediaGroup.push(
                    MediaInput.photo(file.url)
                );
            } else if (file.type === 'audio') {
                if (files.length === 1) {
                    await sendAudio({ business_connection_id: businessId, chat_id: chatId, audio: file.url });
                    return;
                }

                mediaGroup.push(
                    MediaInput.audio(file.url)
                );
            } else if (file.type === 'gif') {
                await sendAnimation({ business_connection_id: businessId, chat_id: chatId, animation: file.url });
                if (file.remove) {
                    localDownload.removeFile(file.remove);
                }
            }
        }

        if (files.length) {
            const mediaChunk = chunk(mediaGroup, 10);
            for (const media of mediaChunk) {
                await sendMediaGroup({ business_connection_id: businessId, chat_id: chatId, media });
            }
        }
    } catch (error) {
        const errorMsg = '[MessageSend] Failed to send media - ' + String(error);
        console.error(errorMsg);
        throw new Error(errorMsg);
    } finally {
        files.forEach(x => {
            if (x.remove) {
                localDownload.removeFile(x.remove);
            }
        });
    }
};

export const messageSend = async (link: string, chatId: string | number, businessId: string | undefined = undefined) => {
    const isTikTok = /tiktok/.test(link);

    const methods = [
        () => ytdl.download(link),
        () => cobalt.getFiles(link),
        ...(isTikTok ? [
            () => ttApiDl.getFilesV1(link),
            () => ttApiDl.getFilesV2(link),
            () => ttApiDl.getFilesV3(link),
            () => tikwm.getFiles(link)
        ] : [])
    ];

    let lastError: Error | undefined;

    for (const getFiles of methods) {
        try {
            const files = await getFiles();
            await main(files, link, chatId, businessId);
            return;
        } catch (error) {
            lastError = error as Error;
        }
    }

    const errorMsg = lastError
        ? `[MessageSend] All methods failed. Last error: ${String(lastError)}`
        : '[MessageSend] No methods available for this URL';
    console.error(errorMsg);
    throw new Error(errorMsg);
};
