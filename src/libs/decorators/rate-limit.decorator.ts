import { SetMetadata } from '@nestjs/common';

export const ENDPOINT_RATE_LIMIT_KEY = 'endpoint_rate_limit_config';

export interface EndpointRateLimitConfig {
    limit: number;    // Max requests per time window
    ttl?: number;     // Time window in ms (default: 1000ms = 1 second)
}

/**
 * Endpoint-scoped rate limit decorator.
 * Overrides global rate limits for a specific endpoint.
 * Works with all three guard types: IP, User, and API Key.
 * 
 * The rate limit key includes the endpoint path, making it endpoint-specific.
 * 
 * @example
 * // 10 requests per second for this endpoint
 * @EndpointRateLimit({ limit: 10 })
 * @Post('strict-endpoint')
 * 
 * // 5 requests per minute for this endpoint
 * @EndpointRateLimit({ limit: 5, ttl: 60000 })
 * @Get('very-strict')
 */
export function EndpointRateLimit(config: EndpointRateLimitConfig) {
    return SetMetadata(ENDPOINT_RATE_LIMIT_KEY, config);
}
