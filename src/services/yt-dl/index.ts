import { youtubeDl } from 'youtube-dl-exec';
import path from 'path';
import { IFile } from '../../types/files';
import { MediaUpload } from 'gramio';


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

    private downloadMedia = async (url: string, customPath: string, customName: string) => {
        try {
            await youtubeDl(url, {
                paths: customPath,
                output: customName,
                noCheckCertificates: true,
                noWarnings: true,
                noProgress: true,
                retries: 3,
                maxFilesize: '2000M',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'
            });
        } catch (error) {
            throw new Error('[Ytdl] downloadMedia Error downloading media: ' + error);
        }
    };

    public download = async (url: string): Promise<IFile[]> => {
        const info = await this.getInfo(url);
        if (typeof info === 'string') {
            throw new Error('[Ytdl] download Invalid content info received: ' + info);
        }

        const customPath = path.join(__dirname, 'temp');
        const customName = `${info.title} [${new Date().getTime()}].${info.ext}`;
        const pathToFile = path.join(customPath, customName);

        await this.downloadMedia(url, customPath, customName);

        return [{
            type: info.ext === 'm4a' ? 'audio' : 'video',
            url: await MediaUpload.path(pathToFile),
            remove: pathToFile
        }];
    };
}

export const ytdl = new Ytdl();
