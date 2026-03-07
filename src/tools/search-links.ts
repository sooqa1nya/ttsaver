import { supportedLinks, supportedLinksInline } from './supported-links';

export const searchLinks = (text: string, inline: boolean = false) => {
    let result: string[] = [];

    for (const regexp of inline ? supportedLinksInline() : supportedLinks()) {
        const links = text.match(regexp);
        if (links)
            result = result.concat(links);
    }

    if (!result.length)
        return null;

    return result;
};