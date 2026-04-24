import { Downloader } from '@tobyg74/tiktok-api-dl';
import { IFile } from '../../types/files';


class TikTokApiDl {
    public getFiles = async (link: string) => {
        let files: IFile[] = [];

        const download = await Downloader(link, {
            version: 'v1'
        });
        if (download.result?.images) {
            for (const element of download.result.images) {
                files.push({
                    type: 'photo',
                    url: element
                });
            }
        } else if (download.result?.video) {
            files.push({
                type: 'video',
                url: download.result.video.downloadAddr[0]
            });
        }

        return files;
    };
}

export const ttApiDl = new TikTokApiDl();