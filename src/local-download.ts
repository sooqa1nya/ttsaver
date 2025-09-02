import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { createWriteStream } from 'fs';

export const localDownload = async (urls: Array<string>) => {
    const fileName = String(new Date().getTime());

    let allFiles: { extension: string, directories: string[]; } = { extension: "", directories: [] };

    const streamPipeline = promisify(pipeline);

    for (let i = 0; i < urls.length; i++) {
        try {
            const response = await axios({
                method: 'GET',
                url: urls[i],
                responseType: 'stream'
            });

            let fileExtension;
            let contentType = response.headers['content-type'];

            if (!contentType || !fileFormat.hasOwnProperty(contentType)) {
                const contentDisposition = response.headers['content-disposition'];
                if (!contentDisposition) {
                    throw new Error('Не удалось определить тип содержимого');
                }
                console.log(contentDisposition);
                fileExtension = contentDisposition.match(/\.(mp4|gif|jpg|mp3)/)[0];
            } else {
                fileExtension = fileFormat[contentType];
            }

            if (!fileExtension) {
                throw new Error(`Неизвестный формат файла: ${contentType}`);
            }
            allFiles.extension = fileExtension;

            const filePath: string = path.join(__dirname, `/temp/${fileName}-${i}${fileExtension}`);
            allFiles.directories.push(filePath);

            const fileStream = createWriteStream(filePath);

            await streamPipeline(response.data, fileStream);
        } catch (e: any) {
            console.error('Ошибка при скачивании файла:', e.message);
        }
    }

    return allFiles;
};

const fileFormat: { [key: string]: string; } = {
    "image/jpeg": ".jpg",
    "audio/mpeg": ".mp3",
    "video/mp4": ".mp4",
    "image/gif": ".gif"
};

export const localUnlink = async (directories: Array<string>): Promise<void> => {
    directories.forEach(directory => {
        fs.unlinkSync(directory);
    });
};

export const isTemp = async () => {
    const pathTemp = path.join(__dirname, `/temp`);
    const folderTemp = fs.existsSync(pathTemp);
    if (!folderTemp) fs.mkdirSync(pathTemp);
};