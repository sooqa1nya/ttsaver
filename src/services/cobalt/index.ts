import { IResponseCobalt } from './types';

class Cobalt {
    public download = async (url: string) => {
        const response = await fetch('http://cobalt-api:9000/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const result: IResponseCobalt = await response.json();

        if (result.status === 'error') {
            console.error('Cobalt Error: ' + JSON.stringify(result.error));
            throw new Error;
        }

        return result;
    };

    private getFileExtension = async (fileName: string) => {
        const fileExtension = fileName.match(/\.\w+/);
        if (!fileExtension)
            throw new Error;

        return fileExtension[0];
    };

    public getFileType = async (fileName: string) => {
        const extension = await this.getFileExtension(fileName);
        switch (extension) {
            case '.mp4':
                return 'video';
            case '.webm':
                return 'video';
            case '.mkv':
                return 'video';
            case '.mp3':
                return 'audio';
            case '.gif':
                return 'gif';
            case '.jpg':
                return 'photo';
            case '.png':
                return 'photo';
            default:
                throw new Error;
        }
    };
}

export const cobalt = new Cobalt();

export const supportREGEX = [
    /(https?:\/\/)?(www\.)?youtu(be)?\.(be|com)\/[\S]+/,
    /(https?:\/\/)?(dd)?(?:m|www|vm|vt)\.instagram\.com\/(reel|p)\/([\S]+)/,
    /(https?:\/\/)?(?:m|www|vm|vt)\.tiktok\.com\/[\S]+/,
    /(https?:\/\/)?vk\.com\/([\S]+)/,
    /(https?:\/\/)?(?:on\.)?soundcloud\.com\/([\S]+)/,
    /(https?:\/\/)?pin\.it\/([\S]+)/,
    /(https?:\/\/)?x\.com\/([\S]+)/,
    /(https?:\/\/)?twitter\.com\/([\S]+)/,
    /(https?:\/\/)?(www\.)?twitch\.(tv)\/[\S]+\/clip\/[\S]+/
];