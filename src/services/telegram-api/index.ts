import { EditMessageMediaParams, SendAnimationParams, SendAudioParams, SendMediaGroupParams, SendMessageParams, SendPhotoParams, SendVideoParams } from 'gramio';
import { bot } from '../../bot';

export const sendMessage = async (params: SendMessageParams) => {
    return await bot.api.sendMessage(params);
};

export const sendMediaGroup = async (params: SendMediaGroupParams) => {
    return await bot.api.sendMediaGroup(params);
};

export const sendAnimation = async (params: SendAnimationParams) => {
    return await bot.api.sendAnimation(params);
};

export const editMedia = async (params: EditMessageMediaParams) => {
    return await bot.api.editMessageMedia(params);
};

export const sendVideo = async (params: SendVideoParams) => {
    return await bot.api.sendVideo(params);
};

export const sendAudio = async (params: SendAudioParams) => {
    return await bot.api.sendAudio(params);
};

export const sendPhoto = async (params: SendPhotoParams) => {
    return await bot.api.sendPhoto(params);
};