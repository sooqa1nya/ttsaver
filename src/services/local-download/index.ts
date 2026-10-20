import axios from 'axios';
import path from 'node:path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { createWriteStream } from 'fs';
import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';


class LocalDownload {
    public async download(url: string, fileName: string): Promise<string> {
        const folderPath = path.join(process.cwd(), 'temp/' + randomUUID());
        const streamPipeline = promisify(pipeline);
        const filePath: string = path.join(folderPath, fileName);

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

            return folderPath;
        } catch (error) {
            this.removeFolder(folderPath);
            const errorMsg = `[LocalDownload] Failed to download URL: ${url}. Error: ${String(error)}`;
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
    }

    public async removeFolder(folderPath: string) {
        try {
            await rm(folderPath, { recursive: true, force: true });
        } catch (error) {
            console.error('[LocalDownload] Failed to remove folder', folderPath, error);
        }
    }
}

export const localDownload = new LocalDownload();