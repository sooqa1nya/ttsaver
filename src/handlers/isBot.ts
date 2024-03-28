import { MessageContext, NextMiddleware } from 'puregram';

export const isBot = async (context: MessageContext, next: NextMiddleware) => {

    if (context.hasViaBot()) {
        return;
    }

    await next();

};