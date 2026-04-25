import { Downloader } from '@tobyg74/tiktok-api-dl';
import { IFile } from '../../types/files';


class TikTokApiDl {
    private validateVideoUrl = async (url: string): Promise<boolean> => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Range': 'bytes=0-1'
                }
            });

            const contentType = response.headers.get('content-type');
            const contentLength = response.headers.get('content-length');

            return (
                (response.ok || response.status === 206) &&
                (contentType?.includes('video') ?? false) &&
                (parseInt(contentLength || '0') > 0)
            );
        } catch (error) {
            console.error('[TikTokApiDl] Error validating video URL:', url, error);
            return false;
        }
    };

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
                const isValid = await this.validateVideoUrl(videoUrl);

                if (!isValid) {
                    console.warn(`[TikTokApiDl] Invalid video URL, skipping: ${videoUrl}`);
                    continue;
                }

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
                files.push({
                    type: 'photo',
                    url: element
                });
            }
        } else if (download.result?.video) {
            const videoUrls = Array.isArray(download.result.video)
                ? download.result.video
                : [download.result.video];

            for (const videoUrl of videoUrls) {
                const isValid = await this.validateVideoUrl(videoUrl);

                if (!isValid) {
                    console.warn(`[TikTokApiDl] Invalid video URL, skipping: ${videoUrl}`);
                    continue;
                }

                files.push({
                    type: 'video',
                    url: videoUrl
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
        } else if (download.result?.video_hd) {
            const videoUrls = Array.isArray(download.result.video_hd)
                ? download.result.video_hd
                : [download.result.video_hd];

            for (const videoUrl of videoUrls) {
                const isValid = await this.validateVideoUrl(videoUrl);

                if (!isValid) {
                    console.warn(`[TikTokApiDl] Invalid video URL, skipping: ${videoUrl}`);
                    continue;
                }

                files.push({
                    type: 'video',
                    url: videoUrl
                });
            }
        } else if (download.result?.video1) {
            const videoUrls = Array.isArray(download.result.video1)
                ? download.result.video1
                : [download.result.video1];

            for (const videoUrl of videoUrls) {
                const isValid = await this.validateVideoUrl(videoUrl);

                if (!isValid) {
                    console.warn(`[TikTokApiDl] Invalid video URL, skipping: ${videoUrl}`);
                    continue;
                }

                files.push({
                    type: 'video',
                    url: videoUrl
                });
            }
        } else if (download.result?.video2) {
            const videoUrls = Array.isArray(download.result.video2)
                ? download.result.video2
                : [download.result.video2];

            for (const videoUrl of videoUrls) {
                const isValid = await this.validateVideoUrl(videoUrl);

                if (!isValid) {
                    console.warn(`[TikTokApiDl] Invalid video URL, skipping: ${videoUrl}`);
                    continue;
                }

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
}

export const ttApiDl = new TikTokApiDl();