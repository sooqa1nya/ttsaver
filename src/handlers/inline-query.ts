import { InlineQueryContext, InputMedia, MediaSource, MessageContext } from 'puregram';

import { cobalt, supportREGEX } from '../cobalt-api';
import { sendVideo, sendAudio, sendMediaGroup, sendAnimation, sendMessage } from '../puregramMethods';
import { localDownload, localUnlink } from '../local-download';
import { TelegramInlineQueryResult, TelegramInputMediaPhoto } from 'puregram/generated';


export const inlineQueryHandler = async (context: InlineQueryContext & MessageContext) => {

    const linksForDownload: Array<string> = [];
    const UID = String(new Date().getTime());

    const query = context.query;

    if (!supportREGEX.some((element) => element.test(query))) {
        return;
    }

    const cobaltData = await cobalt(context.query);

    if (!cobaltData || cobaltData.status == 'error') {
        const errorCore = !cobaltData ? '1001' : '1002';
        await context.answerInlineQuery([
            {
                type: 'article',
                id: UID,
                title: `💔 Downloader error (#${errorCore})`,
                input_message_content:
                {
                    message_text: 'Hola 😁'
                }
            }
        ]);

        console.error(query, cobaltData);
        await sendMessage(<string>process.env.chatlog, `[ERROR] Downloader error (#${errorCore})`);

        return;
    }


    switch (cobaltData.status) {
        case 'picker':
            for (let i = 0; i < cobaltData.picker.length; i++) {
                linksForDownload.push(cobaltData.picker[i].url);
            }
            break;
        case 'tunnel':
        case 'redirect':
        case 'stream':
            linksForDownload.push(cobaltData.url);
            break;
        default:
            await context.send(`[ERROR] Cobalt status (${cobaltData.status}) not found.`, { chat_id: <string>process.env.chatlog });
            return;
    }

    const ld = await localDownload(linksForDownload);

    try {
        if (ld.extension == '.mp4') {
            const message = await sendVideo(<string>process.env.chatlog, MediaSource.path(ld.directories[0]));

            await context.answerInlineQuery([
                {
                    type: 'video',
                    id: UID,
                    video_file_id: message.video!.file_id,
                    title: "video"
                }
            ]);
        } else if (ld.extension == '.jpg') {
            const photos: TelegramInputMediaPhoto[] = [];
            photos.push(...ld.directories.map(dir => InputMedia.photo(MediaSource.path(dir))));

            const answerArray: TelegramInlineQueryResult[] = [];
            const message = await sendMediaGroup(<string>process.env.chatlog, photos);
            for (let i = 0; i < message.length; i++) {
                const photoArray = message[i].photo;
                if (!photoArray || photoArray.length === 0) {
                    continue;
                }

                answerArray.push(
                    {
                        type: 'photo',
                        id: UID + i,
                        photo_file_id: photoArray[photoArray.length - 1].file_id
                    }
                );

            }

            await context.answerInlineQuery(answerArray);
        } else if (ld.extension == '.mp3') {
            const message = await sendAudio(<string>process.env.chatlog, MediaSource.path(ld.directories[0]));

            await context.answerInlineQuery([
                {
                    type: 'audio',
                    id: UID,
                    audio_file_id: message.audio!.file_id
                }
            ]);
        } else if (ld.extension == '.gif') {
            const message = await sendAnimation(<string>process.env.chatlog, MediaSource.path(ld.directories[0]));

            await context.answerInlineQuery([
                {
                    type: 'gif',
                    id: UID,
                    gif_file_id: message.animation!.file_id
                }
            ]);
        }
    } catch (e: any) {
        await context.answerInlineQuery([
            {
                type: 'article',
                id: UID,
                title: '💔 Couldn\'t send an attachment (#1003)',
                input_message_content:
                {
                    message_text: 'Hola 😁'
                }
            }
        ]);

        console.error(query, e);
        await sendMessage(<string>process.env.chatlog, '[ERROR] Downloader error (#1003)');
    } finally {
        await localUnlink(ld.directories);
    }
};