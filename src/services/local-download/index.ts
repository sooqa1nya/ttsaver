import axios from 'axios';
import path from 'node:path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { createWriteStream } from 'fs';
import { mkdir } from 'node:fs/promises';
import { unlink } from 'node:fs';

class LocalDownload {
    private folderPath: string = path.join(process.cwd(), "temp");

    public async download(url: string, fileName: string): Promise<string> {
        await mkdir(this.folderPath, { recursive: true });
        const streamPipeline = promisify(pipeline);
        const filePath: string = path.join(this.folderPath, fileName);

        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'video/mp4,video/*,*/*'
                },
                maxRedirects: 5,
                timeout: 15000
            });

            if (response.status !== 200) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const fileStream = createWriteStream(filePath);

            await streamPipeline(response.data, fileStream);

            return filePath;
        } catch (error) {
            this.removeFile(filePath);
            const errorMsg = `[LocalDownload] Failed to download URL: ${url}. Error: ${String(error)}`;
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
    }

    public removeFile(filePath: string) {
        unlink(filePath, err => {
            if (err && err.code !== 'ENOENT') {
                const errorMsg = '[LocalDownload] Failed to remove file: ' + filePath + ' - ' + String(err);
                console.error(errorMsg);
            }
        });
    }
}

export const localDownload = new LocalDownload();