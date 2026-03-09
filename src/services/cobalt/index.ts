import { MediaUpload } from 'gramio';
import { localDownload } from '../local-download';
import { IResponseCobalt } from './types';
import { scheduler } from 'node:timers/promises';

class Cobalt {
    public download = async (url: string, count: number = 1) => {
        const response = await fetch('http://cobalt-api:9000/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const result: IResponseCobalt = await response.json();

        if (result.status === 'error') {
            if (result.error.code === 'error.api.fetch.fail' && count < 3) {
                await scheduler.wait(1000);
                await this.download(url, count + 1);
            }
            throw new Error(`Cobalt${count > 1 ? ' ' + count : ''}: ` + JSON.stringify(result.error, undefined, 2));
        }

        return result;
    };

    public getFiles = async (link: string) => {
        let files: {
            type: 'video' | 'photo' | 'gif' | 'audio';
            url: File;
            remove?: string;
        }[] = [];

        const download = await cobalt.download(link);
        if (download.status === 'redirect') {
            files.push({
                type: await cobalt.getFileType(download.filename),
                url: await MediaUpload.url(download.url),
            });
        } else if (download.status === 'tunnel') {
            const localFile = await localDownload.download(download.url, Math.floor(Math.random() * 100000).toString() + download.filename);
            files.push({
                type: await cobalt.getFileType(download.filename),
                url: await MediaUpload.path(localFile),
            });
        } else if (download.status === 'picker') {
            for (const element of download.picker) {
                const isRemove = /http:\/\/cobalt-api:9000/.test(element.url);
                files.push({
                    type: element.type,
                    url: isRemove ? await MediaUpload.path(element.url) : await MediaUpload.url(element.url),
                    ...(isRemove && { remove: element.url })
                });
            }
        }

        return files;
    };



    private getFileExtension = async (fileName: string) => {
        const fileExtension = fileName.match(/\.\w+$/);
        if (!fileExtension)
            throw new Error('getFileExtension');

        return fileExtension[0];
    };

    public getFileType = async (fileName: string) => {
        const extension = await this.getFileExtension(fileName);
        switch (extension) {
            case '.mp4':
                return 'video';
            case '.webm':
                return 'video';
            case '.mkv':
                return 'video';
            case '.mp3':
                return 'audio';
            case '.gif':
                return 'gif';
            case '.jpg':
                return 'photo';
            case '.png':
                return 'photo';
            default:
                throw new Error('getFileType: ' + extension);
        }
    };
}

export const cobalt = new Cobalt();