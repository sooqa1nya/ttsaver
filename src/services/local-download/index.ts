import axios from 'axios';
import path from 'node:path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { createWriteStream } from 'fs';
import { mkdir } from 'node:fs/promises';
import { unlink } from 'node:fs';

class LocalDownload {
    private folderPath: string = path.join(__dirname, `/temp`);

    public async download(url: string, fileName: string) {
        await mkdir(this.folderPath, { recursive: true });
        const streamPipeline = promisify(pipeline);

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        if (!response)
            throw new Error('Axios download');

        const filePath: string = this.folderPath + '/' + fileName;
        const fileStream = createWriteStream(filePath);

        await streamPipeline(response.data, fileStream);

        return filePath;
    }

    public removeFile(filePath: string) {
        unlink(filePath, err => {
            if (err)
                throw new Error('removeFile');
        });
    }
}

export const localDownload = new LocalDownload();

(async () => {

})();