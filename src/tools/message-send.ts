import { MediaInput, TelegramParams } from 'gramio';
import { cobalt } from '../services/cobalt';
import { localDownload } from '../services/local-download';
import { sendAnimation, sendAudio, sendMediaGroup, sendPhoto, sendVideo } from '../services/telegram-api';
import { chunk } from './chunk';


export const messageSend = async (link: string, chatId: string | number, businessId: string | undefined = undefined,) => {
    const files = await cobalt.getFiles(link);

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
                continue;
            }
        }

        if (files.length) {
            const mediaChunk = chunk(mediaGroup, 10);
            for (const media of mediaChunk) {
                await sendMediaGroup({ business_connection_id: businessId, chat_id: chatId, media });
            }
        }
    } finally {
        files
            .forEach(x => {
                if (x.remove) {
                    localDownload.removeFile(x.remove);
                }
            });
    }
};