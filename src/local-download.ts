import { MediaInput, MediaSource } from 'puregram';
import { TelegramInputMediaPhoto } from 'puregram/generated';
import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import chunk from 'chunk';


interface ILocalDownload<T> {
    media: T extends 'photo' ? TelegramInputMediaPhoto[][] : MediaInput;
    allDirectories: string[];
}


export const local_download = async <T extends 'photo' | 'video'>(urls: Array<string>, type: T): Promise<ILocalDownload<T>> => {

    const fileName = new Date().getTime();
    enum Formats {
        photo = ".png",
        video = '.mp4'
    }
    const format = Formats[type];
    let allDirectories: Array<string> = [];

    for (let i = 0; i < urls.length; i++) {

        const image = await axios.get(urls[i], {
            responseType: 'stream',
        });

        const directory = path.join(__dirname, `/temp/${fileName}-${i}${format}`);
        allDirectories.push(directory);

        const writer = fs.createWriteStream(directory);
        await image.data.pipe(writer);
        await new Promise((resolve) => {
            writer.on('finish', resolve);
        });

    }


    let media: TelegramInputMediaPhoto[][] | MediaInput;

    if (type === 'photo') {

        let arrayMedia: Array<TelegramInputMediaPhoto> = [];

        for (let i = 0; i < urls.length; i++) {

            arrayMedia.push({
                type: 'photo',
                media: MediaSource.path(path.join(__dirname, `/temp/${fileName}-${i}${format}`))
            });

        }


        media = chunk(arrayMedia, 10);

    } else {

        media = MediaSource.path(path.join(__dirname, `/temp/${fileName}-0${format}`));

    }

    return {
        media,
        allDirectories
    } as ILocalDownload<T>;

};

export const local_unlink = async (directories: Array<string>): Promise<void> => {
    directories.forEach(directory => {
        fs.unlinkSync(directory);
    });
};

export const local_isTemp = async () => {
    const pathTemp = path.join(__dirname, `/temp`);
    const folderTemp = fs.existsSync(pathTemp);
    if (!folderTemp) fs.mkdirSync(pathTemp);
};