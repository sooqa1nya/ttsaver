import { cobalt } from '../services/cobalt';
import { ttApiDl } from '../services/tiktok-api-dl';
import { tikwm } from '../services/tikwm';
import { ytdl } from '../services/yt-dl';

export const getMethods = (link: string) => {
    const isTikTok = /tiktok/.test(link);
    return [
        () => ytdl.download(link),
        // () => cobalt.getFiles(link),
        // ...(isTikTok ? [
        //     () => ttApiDl.getFilesV1(link),
        //     () => ttApiDl.getFilesV2(link),
        //     () => ttApiDl.getFilesV3(link),
        //     () => tikwm.getFiles(link)
        // ] : [])
    ];
};