export const cobalt = async (url: string) => {
    try {
        return (await fetch('http://cobalt-api:9000/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        }
        )).json();
    } catch (e: any) {
        throw new Error(e.message);
    }
};

export const supportREGEX = [
    /(https?:\/\/)?(www\.)?youtu(be)?\.(be|com)\/[\S]+/,
    /(https?:\/\/)?(dd)?(?:m|www|vm|vt)\.instagram\.com\/reel\/([\S]+)/,
    /(https?:\/\/)?(?:m|www|vm|vt)\.tiktok\.com\/[\S]+/,
    /(https?:\/\/)?vk\.com\/([\S]+)/,
    /(https?:\/\/)?(?:on\.)?soundcloud\.com\/([\S]+)/,
    /(https?:\/\/)?pin\.it\/([\S]+)/,
    /(https?:\/\/)?x\.com\/([\S]+)/,
    /(https?:\/\/)?twitter\.com\/([\S]+)/,
    /(https?:\/\/)?(www\.)?twitch\.(tv)\/[\S]+\/clip\/[\S]+/
];