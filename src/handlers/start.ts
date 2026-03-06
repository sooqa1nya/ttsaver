import { Composer, Keyboard, type Bot, type MessageContext } from 'gramio';


const handleStart = async (context: MessageContext<Bot> & { args: string | null; }) => {
    const text = `
Welcome!
Just send me the link and I'll take care of everything 😏
`;

    await context.send(text, {
        reply_markup: new Keyboard()
            .text('ℹ️ Information', { style: 'primary' })
            .text('💳 Support project', { style: 'primary' })
    });
};

const info = async (context: MessageContext<Bot>) => {
    const text = `
We are not responsible for content sent by the bot. The bot only downloads and sends videos via links sent by users.

Supported sites include: TikTok, YouTube Shorts, Instagram, Twitter (X), Twitch clips, Pinterest, SoundCloud, and VK video.

You can download media by sending a link to the bot's private messages. The bot also supports group chats (you need to give the bot permission to read and send messages). You can also download and send media within PM by writing: @bluesaverbot *link*

New!
The bot supports business mode. If you have Telegram Premium, you can connect it as a chat bot. After that, the bot will automatically search for supported links in the dialogue and send media. Permissions to read and send messages are required.

I developed the bot for free use, so you won't see any ads here (maybe 😁).
I also don't receive any money, so I would be very grateful for any support. You can get the details by clicking on the “💳 Support project” button.

Support: @blue_sup
`;

    await context.send(text, { parse_mode: 'HTML' });
};

const supportAuthor = async (context: MessageContext<Bot>) => {
    const text = `
💳 Support the author:
TRC20: <code>TWZ3XCLhNB4BRLMiQ2ftj5h4raK1uXneXP</code>
`;

    await context.send(text, { parse_mode: 'HTML' });
};

export const start = new Composer()
    .command('start', handleStart)
    .hears('ℹ️ Information', info)
    .hears('💳 Support project', supportAuthor);