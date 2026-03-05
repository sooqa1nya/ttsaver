import { supportedLinks } from './supported-links';

export const searchLinks = (text: string) => {
    let result: string[] = [];

    for (const regexp of supportedLinks()) {
        const links = text.match(regexp);
        if (links)
            result = result.concat(links);
    }

    if (result.length)
        return result;

    return null;
};