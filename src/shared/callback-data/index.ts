import { CallbackData } from 'gramio';


export const urlData = new CallbackData('urlData')
    .number('c')
    .string('url');