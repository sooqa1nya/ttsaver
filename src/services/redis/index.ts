import { createClient, RedisClientType } from "redis";

class Redis {
    private client;

    constructor() {
        this.client = createClient({
            url: "redis://:redis@redis:6379",
        })
            .on("error", (err) => console.log("Redis Client Error", err))
            .connect();
    }

    public async set(key: string, value: string) {
        return (await this.client).set(key, value, { EX: 604800 });
    }

    public async get(key: string) {
        return (await this.client).get(key);
    }
}

export const redis = new Redis();