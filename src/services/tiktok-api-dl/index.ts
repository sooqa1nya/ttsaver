import { Downloader } from '@tobyg74/tiktok-api-dl';
import { IFile } from '../../types/files';


class TikTokApiDl {
    public getFilesV1 = async (link: string) => {
        let files: IFile[] = [];

        const download = await Downloader(link, {
            version: 'v1'
        });

        if (download.status === 'error') {
            throw new Error('tt-api-dl getFilesV1: status error');
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
            throw new Error('tt-api-dl getFilesV1: files error');
        }

        return files;
    };

    public getFilesV2 = async (link: string) => {
        let files: IFile[] = [];

        const download = await Downloader(link, {
            version: 'v2'
        });

        if (download.status === 'error') {
            throw new Error('tt-api-dl getFilesV2: status error');
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
            throw new Error('tt-api-dl getFilesV2: files error');
        }

        return files;
    };

    public getFilesV3 = async (link: string) => {
        let files: IFile[] = [];

        const download = await Downloader(link, {
            version: 'v3'
        });

        if (download.status === 'error') {
            throw new Error('tt-api-dl getFilesV3: status error');
        }
        console.log(download.result);
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
            throw new Error('tt-api-dl getFilesV3: files error');
        }

        return files;
    };
}

export const ttApiDl = new TikTokApiDl();