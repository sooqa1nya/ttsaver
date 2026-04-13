import { Composer } from 'gramio';


export const service = new Composer({ name: 'service' })
    .callbackQuery('emptyButton', async context => {
        await context.answerCallbackQuery('✅ This button is for informational purposes only');
    });