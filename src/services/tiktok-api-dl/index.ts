import { Downloader } from '@tobyg74/tiktok-api-dl';
import { IFile } from '../../types/files';
import { localDownload } from '../local-download';
import { MediaUpload } from 'gramio';


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
            for (const videoUrl of download.result.video.downloadAddr) {
                files.push({
                    type: 'video',
                    url: videoUrl
                });
                break;
            }

            if (files.length === 0) {
                throw new Error('[TikTokApiDl] getFilesV1 - No valid video URLs found');
            }
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
                const localFile = await localDownload.download(element, Math.floor(Math.random() * 100000).toString() + download.result.desc + '.jpg');
                files.push({
                    type: 'photo',
                    url: await MediaUpload.path(localFile),
                    remove: localFile
                });
            }
        } else if (download.result?.video) {
            const videoUrls = Array.isArray(download.result.video.playAddr)
                ? download.result.video.playAddr
                : [download.result.video.playAddr];

            for (const videoUrl of videoUrls) {
                const localFile = await localDownload.download(videoUrl, Math.floor(Math.random() * 100000).toString() + download.result.desc + '.mp4');
                files.push({
                    type: 'video',
                    url: await MediaUpload.path(localFile),
                    remove: localFile
                });
                break;
            }

            if (files.length === 0) {
                throw new Error('[TikTokApiDl] getFilesV2 - No valid video URLs found');
            }
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
        } else if (download.result?.videoHD) {
            const videoUrls = Array.isArray(download.result.videoHD)
                ? download.result.videoHD
                : [download.result.videoHD];

            for (const videoUrl of videoUrls) {
                const localFile = await localDownload.download(videoUrl, Math.floor(Math.random() * 100000).toString() + download.result.desc + '.mp4');
                files.push({
                    type: 'video',
                    url: await MediaUpload.path(localFile),
                    remove: localFile
                });
            }
        } else if (download.result?.videoSD) {
            const videoUrls = Array.isArray(download.result.videoSD)
                ? download.result.videoSD
                : [download.result.videoSD];

            for (const videoUrl of videoUrls) {
                files.push({
                    type: 'video',
                    url: videoUrl
                });
            }
        } else {
            const errorMsg = '[TikTokApiDl] getFilesV3 - No valid media found in API response';
            console.error(errorMsg, 'Link:', link, 'Response:', download.result);
            throw new Error(errorMsg);
        }

        return files;
    };
};

export const ttApiDl = new TikTokApiDl();