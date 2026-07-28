import { Payload, youtubeDl } from 'youtube-dl-exec';
import path from 'path';
import { IFile } from '../../types/files';
import { MediaUpload } from 'gramio';
import { localDownload } from '../local-download';


class Ytdl {
    private getInfo = async (url: string) => {
        try {
            return await youtubeDl(url, {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'
            });
        } catch (error) {
            throw new Error('[Ytdl] getInfo Error getting content info: ' + error);
        }
    };

    private getDownloadAll = async (url: string, customPath: string, customName: string) => {
        return await youtubeDl(url, {
            format: 'bestvideo+bestaudio/best',
            mergeOutputFormat: 'mp4',
            paths: customPath,
            output: customName,
            noCheckCertificates: true,
            noWarnings: true,
            noProgress: true,
            retries: 3,
            maxFilesize: '2000M',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'
        });
    };

    private getDownloadCoub = async (url: string, customPath: string, customName: string, info: Payload) => {
        return await youtubeDl(url, {
            format: 'bestvideo+bestaudio/best',
            mergeOutputFormat: 'mp4',
            downloadSections: `*0-${info.duration}`,
            forceKeyframesAtCuts: true,
            paths: customPath,
            output: customName,
            noCheckCertificates: true,
            noWarnings: true,
            noProgress: true,
            retries: 3,
            maxFilesize: '2000M',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'
        });
    };

    private downloadMedia = async (url: string, info: Payload) => {
        try {
            const customPath = path.join(__dirname, 'temp');
            const customName = `%(title)s [${new Date().getTime()}].%(ext)s`;

            const ytdl = /(https?:\/\/)coub\.com\/([\S]+)/.test(url) ? await this.getDownloadCoub(url, customPath, customName, info) : await this.getDownloadAll(url, customPath, customName);

            const logs = ytdl.toString();
            let finalPath: string | null = null;

            // Проверка на превышение максимального размера файла
            if (/^[\s\S]*\[download\]\s+File\s+is\s+larger\s+than\s+max-filesize/.test(logs)) {

                const regex = /^\[download\] Destination:\s+(.+)$/gm;
                [...logs.matchAll(regex)].map(match => localDownload.removeFile(match[1]));

                throw new Error('[Ytdl] downloadMedia Error: File is larger than max-filesize');
            }

            const mergerMatch = logs.match(/[\s\S]*\[Merger\]\s+Merging\s+formats\s+into\s+"(.+?)"/m);

            if (mergerMatch) {
                finalPath = mergerMatch[1];
            } else {
                const downloadMatch = logs.match(/[\s\S]*\[download\]\s+Destination:\s+(.+)$/m);
                if (downloadMatch) {
                    finalPath = downloadMatch[1];
                }
            }

            if (!finalPath) {
                throw new Error('[Ytdl] downloadMedia Error search path');
            }

            return path.resolve(finalPath.trim());
        } catch (error) {
            throw new Error('[Ytdl] downloadMedia Error downloading media: ' + error);
        }
    };

    public download = async (url: string): Promise<IFile[]> => {
        const info = await this.getInfo(url);
        if (typeof info === 'string') {
            throw new Error('[Ytdl] download Invalid content info received: ' + info);
        }

        const pathToFile = await this.downloadMedia(url, info);
        const format = pathToFile.match(/\.(\w+)$/)?.[1];
        const type = (format === 'mp4' || format === 'webm') ? 'video' : 'audio';

        return [{
            type,
            url: await MediaUpload.path(pathToFile),
            remove: pathToFile
        }];
    };
}

export const ytdl = new Ytdl();
