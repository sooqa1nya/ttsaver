export const supportedLinks = () => {
    return [
        /(https?:\/\/)?(?:m|www|vm|vt)\.tiktok\.com\/[\S]+/g,
        /(https?:\/\/)?(www\.)?youtu(be)?\.(be|com)\/[\S]+/g,
        /(https?:\/\/)?(dd)?(?:m|www|vm|vt)\.instagram\.com\/(reel|p)\/([\S]+)/g,
        /(https?:\/\/)?vk\.com\/([\S]+)/g,
        /(https?:\/\/)?(?:on\.)?soundcloud\.com\/([\S]+)/g,
        /(https?:\/\/)?pin\.it\/([\S]+)/g,
        /(https?:\/\/)?x\.com\/([\S]+)/g,
        /(https?:\/\/)?twitter\.com\/([\S]+)/g,
        /(https?:\/\/)?(www\.)?twitch\.(tv)\/[\S]+\/clip\/[\S]+/g
    ];
};