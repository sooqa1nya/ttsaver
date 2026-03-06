export const chunk = <T>(array: T[], columns: number = 10): T[][] => {
    const chunk: T[][] = [];

    for (let i = 0; i < array.length; i += columns) {
        chunk.push(array.slice(i, i + columns));
    }

    return chunk;
};