import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { getRequestMetaData } from 'src/libs/utils/get-request-meta-data';
import { extractDeviceIdFromHeader } from '../utils/extract-device-id';
import { REQUEST_USER_KEY } from 'src/libs/constants/global-constants';

export const refreshTokenBodyKey = 'refresh_token';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  private readonly logger = new Logger(RefreshTokenGuard.name);
  constructor(
    private authService: AuthService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      const metaData = getRequestMetaData(request);

      // Get the refresh token from the request Body (supports: refresh_token, refreshToken, refresh)
      const refreshToken = request.body['refresh_token'] || request.body['refreshToken'] || request.body['refresh'];

      const deviceId = extractDeviceIdFromHeader(request);

      // Check if the refresh token is valid
      request[REQUEST_USER_KEY] =
        await this.authService.validateRefreshToken(refreshToken, metaData, deviceId);

      return true;
    } catch (error) {
      this.logger.error(`Refresh Token guard error: ${error.message}`);
      throw error;
    }
  }
}
