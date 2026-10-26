import 'dotenv/config';
import { bot } from './bot.js';
import { update } from 'youtube-dl-exec';
import { localDownload } from './services/local-download/index.js';


const botStart = async () => {
    const signals = ["SIGINT", "SIGTERM"];

    for (const signal of signals) {
        process.on(signal, async () => {
            console.log(`Received ${signal}. Initiating graceful shutdown...`);
            await bot.stop();
            process.exit(0);
        });
    }

    process.on("uncaughtException", (error) => {
        console.error("Uncaught exception:", error);
    });

    process.on("unhandledRejection", (error) => {
        console.error("Unhandled rejection:", error);
    });

    await update();
    await localDownload.removeFolder(process.cwd() + '/temp');
    await bot.start();
};

botStart();