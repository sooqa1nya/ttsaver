import { SendAnimationParams, SendMediaGroupParams, SendMessageParams } from 'gramio';
import { bot } from '../..';

export const sendMessage = async (params: SendMessageParams) => {
    return await bot.api.sendMessage(params);
};

export const sendMediaGroup = async (params: SendMediaGroupParams) => {
    return await bot.api.sendMediaGroup(params);
};

export const sendAnimation = async (params: SendAnimationParams) => {
    return await bot.api.sendAnimation(params);
};