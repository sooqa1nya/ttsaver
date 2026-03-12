import { InlineKeyboard } from 'gramio';
import { urlData } from '../callback-data';


export const retryKeboard = (url: string, tryCount: number) => {
    return new InlineKeyboard()
        .addIf(tryCount < 3, InlineKeyboard.text('🔄 Retry', urlData.pack({ url, c: tryCount })));
};

export const showMoreKeyboard = (url: string) => {
    return new InlineKeyboard()
        .url('👀 Show more', `https://t.me/bluesaverbot?start=${url}`);
};