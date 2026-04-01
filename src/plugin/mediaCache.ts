import { Composer } from 'gramio';
import { mediaCache } from "@gramio/media-cache";

export const cache = new Composer({ name: 'cache' })
    .extend(mediaCache())
    .as('global');