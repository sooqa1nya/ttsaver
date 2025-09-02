import { Telegram, MediaInput } from 'puregram';
import { TelegramInputMediaAudio, TelegramInputMediaDocument, TelegramInputMediaPhoto, TelegramInputMediaVideo } from 'puregram/generated';
const bot = new Telegram({
    token: process.env.botToken,
    apiRetryLimit: -1
});

export const sendAudio = async (chat_id: number | string, audio: MediaInput) => {
    return await bot.api.sendAudio({
        chat_id,
        audio,
        disable_notification: true
    });
};

export const sendVideo = async (chat_id: number | string, video: MediaInput) => {
    return await bot.api.sendVideo({
        chat_id,
        video,
        supports_streaming: true,
        disable_notification: true
    });
};

export const sendAnimation = async (chat_id: number | string, animation: MediaInput) => {
    return await bot.api.sendAnimation({
        chat_id,
        animation,
        disable_notification: true
    });
};

export const sendMediaGroup = async (chat_id: number | string, media: (TelegramInputMediaAudio | TelegramInputMediaDocument | TelegramInputMediaPhoto | TelegramInputMediaVideo)[]) => {
    return await bot.api.sendMediaGroup({
        chat_id,
        media,
        disable_notification: true
    });
};

export const sendMessage = async (chat_id: number | string, text: string) => {
    return await bot.api.sendMessage({
        chat_id,
        text,
        parse_mode: 'HTML',
        disable_notification: true
    });
};