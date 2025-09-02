import fs from 'node:fs';
import path from 'node:path';

export const isTemp = async () => {
    const pathTemp = path.join(__dirname, `/temp`);
    const folderTemp = fs.existsSync(pathTemp);
    if (!folderTemp) fs.mkdirSync(pathTemp);
};