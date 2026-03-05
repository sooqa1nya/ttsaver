import axios from 'axios';
import path from 'node:path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { createWriteStream } from 'fs';
import { mkdir } from 'node:fs/promises';
import { unlink } from 'node:fs';

class LocalDownload {
    private folderPath: string = path.join(__dirname, `/temp`);

    private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(url, {
            method: 'GET',
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('CryptoBot API error:', error);
            throw new Error;
        }

        return await response.json();
    }

    public async download(url: string, fileName: string) {
        await mkdir(this.folderPath, { recursive: true });
        const streamPipeline = promisify(pipeline);

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        if (!response)
            throw new Error;

        const filePath: string = this.folderPath + '/' + fileName;
        const fileStream = createWriteStream(filePath);

        await streamPipeline(response.data, fileStream);

        return filePath;
    }

    public removeFile(filePath: string) {
        unlink(filePath, err => {
            if (err)
                throw err;
        });
    }
}

export const localDownload = new LocalDownload();

(async () => {

})();