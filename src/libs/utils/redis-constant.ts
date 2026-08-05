export const redisPrefix = {
  userSlugHash: 'users:slug:hashset',
  tokensHash: 'tokens-hash',
};

export const redisTokensHashInternalKeys = {
  refreshToken: 'refreshToken',
  accessToken: 'accessToken',
  createdAt: 'createdAt',
}

export const redisKey = (prefix: string, key: string) => {
  return `${prefix}:${key}`;
};

export const redisUserSlugHashKey = (userId: string) => {
  return redisKey(redisPrefix.userSlugHash, userId);
};

export const redisTokensHashKey = (userId: number) => {
  return redisKey(redisPrefix.tokensHash, `${userId}`);
}
