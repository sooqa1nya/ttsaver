import { MediaUpload } from 'gramio';
import { localDownload } from '../local-download';
import { IResponseCobalt } from './types';
import { scheduler } from 'node:timers/promises';
import { IFile } from '../../types/files';

class Cobalt {
    public download = async (url: string) => {
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
            const errorMsg = `[Cobalt] API error: ${JSON.stringify(result.error, undefined, 2)}`;
            console.error(errorMsg, 'URL:', url);
            throw new Error(errorMsg);
        }

        return result;
    };

    public getFiles = async (link: string) => {
        let files: IFile[] = [];

        const download = await this.download(link);
        if (download.status === 'redirect') {
            files.push({
                type: await this.getFileType(download.filename),
                url: await MediaUpload.url(download.url),
            });
        } else if (download.status === 'tunnel') {
            const localFile = await localDownload.download(download.url, Math.floor(Math.random() * 100000).toString() + download.filename);
            files.push({
                type: await this.getFileType(download.filename),
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
        if (!fileExtension) {
            const errorMsg = '[Cobalt] Unable to extract file extension from: ' + fileName;
            console.error(errorMsg);
            throw new Error(errorMsg);
        }

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
                const errorMsg = '[Cobalt] Unknown file extension: ' + extension + ' for file: ' + fileName;
                console.error(errorMsg);
                throw new Error(errorMsg);
        }
    };
}

export const cobalt = new Cobalt();