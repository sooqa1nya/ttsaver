import { cobalt } from '../services/cobalt';
import { localDownload } from '../services/local-download';
import { editMedia, sendAnimation, sendAudio, sendPhoto, sendVideo } from '../services/telegram-api';


export const inlineSend = async (link: string, inlineMessageId: string) => {
    const chatId: string = process.env.CHAT_LOG!;

    const [file] = await cobalt.getFiles(link);

    if (file.type === 'video') {
        const message = await sendVideo({ chat_id: chatId, video: file.url });
        await editMedia({
            inline_message_id: inlineMessageId,
            media: {
                type: 'video',
                media: message.video!.file_id
            }
        });
    } else if (file.type === 'photo') {
        const message = await sendPhoto({ chat_id: chatId, photo: file.url });
        await editMedia({
            inline_message_id: inlineMessageId,
            media: {
                type: 'photo',
                media: message.photo![0].file_id
            }
        });
    } else if (file.type === 'audio') {
        const message = await sendAudio({ chat_id: chatId, audio: file.url });
        await editMedia({
            inline_message_id: inlineMessageId,
            media: {
                type: 'audio',
                media: message.audio!.file_id
            }
        });
    } else if (file.type === 'gif') {
        const message = await sendAnimation({ chat_id: chatId, animation: file.url });
        await editMedia({
            inline_message_id: inlineMessageId,
            media: {
                type: 'animation',
                media: message.animation!.file_id
            }
        });
    }

    if (file.remove) {
        localDownload.removeFile(file.remove);
    }
};