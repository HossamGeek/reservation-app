import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { RequestMetaData } from './dto/request/login-meta.dto';
import { JwtAccessService } from './jwt-access.service';
import { RedisTokensUtils } from './utils/redis-tokens.utils';
import { LoggingType } from './entities/auth-logging.entity';
import configs from 'src/libs/configs/configs';
import { JwtService } from '@nestjs/jwt';
import { redisTokensHashInternalKeys } from 'src/libs/utils/redis-constant';
import { generateHash } from 'src/libs/utils/encryption';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);
  constructor(
    private readonly jwtAccessService: JwtAccessService,
    private readonly redisTokensUtils: RedisTokensUtils,
    private readonly jwtService: JwtService,
  ) {}
  async refreshToken(
    user: ILoginUser,
    loginMetaDto: RequestMetaData,
    deviceId: string,
  ) {
    const token = await this.jwtAccessService.generateNewToken(
      user,
      loginMetaDto,
      LoggingType.generate_token,
    );

    const refreshToken = await this.jwtAccessService.generateNewToken(
      user,
      loginMetaDto,
      LoggingType.refresh_token,
      {
        secret: configs.REFRESH_TOKEN_SECRET,
        expiresIn: configs.REFRESH_TOKEN_EXPIRY as unknown as number,
      },
    );

    await this.redisTokensUtils.saveTokens(
      user.id,
      deviceId,
      refreshToken,
      token,
    );

    return {
      token,
      refreshToken,
    };
  }

  async validateRefreshToken(
    refreshToken: string,
    metaData: RequestMetaData,
    deviceId: string,
  ) {
    const payload = await this.getPayloadFromAuthRefreshToken(refreshToken);

    const { id } = payload;

    // validate if the refresh token exist in redis
    const deviceTokens = await this.redisTokensUtils.getDeviceTokens(
      id,
      deviceId,
    );

    if (!deviceTokens) {
      throw new UnauthorizedException('Invalid refresh token or revoked');
    }

    const redisRefreshToken =
      deviceTokens[redisTokensHashInternalKeys.refreshToken];

    if (redisRefreshToken && redisRefreshToken != generateHash(refreshToken)) {
      // delete all devices
      await this.revokeMyRefreshToken(payload, metaData);
      throw new UnauthorizedException('Invalid refresh token or revoked');
    }

    return payload;
  }

  async revokeMyRefreshToken(
    user: ILoginUser,
    loginMetaData: RequestMetaData,
    deviceId?: string,
  ) {
    await this.jwtAccessService.saveAuthLog(
      user,
      loginMetaData,
      LoggingType.revoke_refresh_token,
    );

    if (deviceId) {
      await this.redisTokensUtils.deleteMultipleDevices(user.id, [deviceId]);
    } else {
      await this.redisTokensUtils.deleteUserDevices(user.id);
    }

    return {
      message: 'Token revoked successfully',
    };
  }

  private async getPayloadFromAuthRefreshToken(
    refreshToken: string,
  ): Promise<ILoginUser> {
    return this.getPayloadFromRefreshToken(
      refreshToken,
      configs.REFRESH_TOKEN_SECRET,
    );
  }

  private async getPayloadFromRefreshToken<T>(
    refreshToken: string,
    refreshTokenSecret: string,
  ): Promise<T> {
    try {
      return this.jwtService.verify<Promise<T>>(refreshToken, {
        secret: refreshTokenSecret,
      });
    } catch (error) {
      this.logger.error(
        `Refresh token guard error: ${error.stack ?? error.message}`,
      );
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
