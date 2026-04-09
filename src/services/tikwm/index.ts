import axios from 'axios';
import { IFile } from '../../types/files';

class Tikwm {
    private async download(url: string) {
        const response = await axios.post('https://www.tikwm.com/api/',
            new URLSearchParams({ url, hd: '1' }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        if (!response || !response.data.data) {
            throw new Error('tikWM: response');
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
            files.push({
                type: 'video',
                url: download.hdplay || download.play
            });
        }

        return files;
    };
}

export const tikwm = new Tikwm();