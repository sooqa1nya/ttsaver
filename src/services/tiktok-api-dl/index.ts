import { Downloader } from '@tobyg74/tiktok-api-dl';
import { IFile } from '../../types/files';


class TikTokApiDl {
    public getFilesV1 = async (link: string) => {
        let files: IFile[] = [];

        const download = await Downloader(link, {
            version: 'v1'
        });

        if (download.status === 'error') {
            const errorMsg = '[TikTokApiDl] getFilesV1 - API returned error status';
            console.error(errorMsg, 'Link:', link);
            throw new Error(errorMsg);
        }

        if (download.result?.images) {
            for (const element of download.result.images) {
                files.push({
                    type: 'photo',
                    url: element
                });
            }
        } else if (download.result?.video?.downloadAddr) {
            files.push({
                type: 'video',
                url: download.result.video.downloadAddr[0]
            });
        } else {
            const errorMsg = '[TikTokApiDl] getFilesV1 - No valid media found in API response';
            console.error(errorMsg, 'Link:', link, 'Response:', download.result);
            throw new Error(errorMsg);
        }

        return files;
    };

    public getFilesV2 = async (link: string) => {
        let files: IFile[] = [];

        const download = await Downloader(link, {
            version: 'v2'
        });

        if (download.status === 'error') {
            const errorMsg = '[TikTokApiDl] getFilesV2 - API returned error status';
            console.error(errorMsg, 'Link:', link);
            throw new Error(errorMsg);
        }

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
                url: download.result.video
            });
        } else {
            const errorMsg = '[TikTokApiDl] getFilesV2 - No valid media found in API response';
            console.error(errorMsg, 'Link:', link, 'Response:', download.result);
            throw new Error(errorMsg);
        }

        return files;
    };

    public getFilesV3 = async (link: string) => {
        let files: IFile[] = [];

        const download = await Downloader(link, {
            version: 'v3'
        });

        if (download.status === 'error') {
            const errorMsg = '[TikTokApiDl] getFilesV3 - API returned error status';
            console.error(errorMsg, 'Link:', link);
            throw new Error(errorMsg);
        }
        if (download.result?.images) {
            for (const element of download.result.images) {
                files.push({
                    type: 'photo',
                    url: element
                });
            }
        } else if (download.result?.video_hd) {
            files.push({
                type: 'video',
                url: download.result.video_hd
            });
        } else if (download.result?.video1) {
            files.push({
                type: 'video',
                url: download.result.video1
            });
        } else if (download.result?.video2) {
            files.push({
                type: 'video',
                url: download.result.video2
            });
        } else {
            const errorMsg = '[TikTokApiDl] getFilesV3 - No valid media found in API response';
            console.error(errorMsg, 'Link:', link, 'Response:', download.result);
            throw new Error(errorMsg);
        }

        return files;
    };
}

export const ttApiDl = new TikTokApiDl();