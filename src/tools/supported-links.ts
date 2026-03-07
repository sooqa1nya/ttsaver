const base: RegExp[] = [
    /(https?:\/\/)?(?:m|www|vm|vt)\.tiktok\.com\/[\S]+/,
    /(https?:\/\/)?(www\.)?youtu(be)?\.(be|com)\/[\S]+/,
    /(https?:\/\/)?(dd)?(?:m|www|vm|vt)\.instagram\.com\/(reel|p)\/([\S]+)/,
    /(https?:\/\/)?vk\.com\/([\S]+)/,
    /(https?:\/\/)?(?:on\.)?soundcloud\.com\/([\S]+)/,
    /(https?:\/\/)?pin\.it\/([\S]+)/,
    /(https?:\/\/)?x\.com\/([\S]+)/,
    /(https?:\/\/)?twitter\.com\/([\S]+)/,
    /(https?:\/\/)?(www\.)?twitch\.(tv)\/[\S]+\/clip\/[\S]+/
];

export const supportedLinks = (): RegExp[] =>
    base.map(r => new RegExp(r.source, 'g'));

export const supportedLinksInline = (): RegExp[] =>
    base.map(r => new RegExp(`^${r.source}$`));