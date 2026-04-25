import axios from 'axios';
import { IFile } from '../../types/files';

class Tikwm {
    private async validateVideoUrl(url: string): Promise<boolean> {
        try {
            const response = await axios.head(url, {
                headers: {
                    'Range': 'bytes=0-1'
                },
                timeout: 5000
            });

            const contentType = String(response.headers['content-type'] || '');
            const contentLength = String(response.headers['content-length'] || '0');

            return (
                (response.status === 200 || response.status === 206) &&
                contentType.includes('video') &&
                (parseInt(contentLength) > 0)
            );
        } catch (error) {
            console.error('[TikWM] Error validating video URL:', url, error);
            return false;
        }
    }

    private async download(url: string) {
        const response = await axios.post('https://www.tikwm.com/api/',
            new URLSearchParams({ url, hd: '1' }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        if (!response || !response.data.data) {
            const errorMsg = '[TikWM] API response is empty or invalid for URL: ' + url;
            console.error(errorMsg);
            throw new Error(errorMsg);
        }

        return response.data.data;
    }

    public getFiles = async (link: string) => {
        let files: IFile[] = [];

        const download = await this.download(link);
        if (download.images) {
            for (const image of download.images) {
                files.push({
                    type: 'photo',
                    url: image
                });
            }
        } else {
            const videoUrl = download.hdplay || download.play;

            if (!videoUrl) {
                const errorMsg = '[TikWM] No video URL found in API response';
                console.error(errorMsg);
                throw new Error(errorMsg);
            }

            const isValid = await this.validateVideoUrl(videoUrl);

            if (!isValid) {
                throw new Error(`[TikWM] Invalid video URL or file not accessible: ${videoUrl}`);
            }

            files.push({
                type: 'video',
                url: videoUrl
            });
        }

        return files;
    };
}

export const tikwm = new Tikwm();