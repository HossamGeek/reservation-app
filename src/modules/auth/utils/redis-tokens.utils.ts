import { Injectable } from "@nestjs/common";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";
import { redisTokensHashKey } from "src/libs/utils/redis-constant";
import { IRedisTokens } from "../interfaces/redis-tokens.interface";
import { generateHash } from "src/libs/utils/encryption";

@Injectable()
export class RedisTokensUtils {
    constructor(
        @InjectRedis() private readonly redis: Redis,
    ) { }

    async saveTokens(
        userId: string,
        deviceId: string,
        refreshToken: string,
        accessToken: string,
    ) {
        const hashedRefreshToken = generateHash(refreshToken);
        const hashedAccessToken = generateHash(accessToken);

        const data: IRedisTokens = {
            refreshToken: hashedRefreshToken,
            accessToken: hashedAccessToken,
            createdAt: Date.now(),
        };

        await this.redis.hset(
            redisTokensHashKey(+userId),
            deviceId,
            JSON.stringify(data),
        );
    }

    async getDeviceTokens(
        userId: string,
        deviceId: string,
    ): Promise<IRedisTokens | null> {
        const tokens = await this.redis.hget(
            redisTokensHashKey(+userId),
            deviceId,
        );

        return tokens ? JSON.parse(tokens) : null;
    }

    async deleteMultipleDevices(
        userId: string,
        deviceIds: string[],
    ) {
        await this.redis.hdel(redisTokensHashKey(+userId), ...deviceIds);
    }

    async deleteUserDevices(userId: string) {
        await this.redis.del(redisTokensHashKey(+userId));
    }
}