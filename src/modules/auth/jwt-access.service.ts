import { Injectable } from '@nestjs/common';
import { RequestMetaData } from './dto/request/login-meta.dto';
import { IUserTokenPayload } from 'src/libs/interfaces/user-token-payload.interface';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { convertJwtTimeToMilliseconds } from 'src/libs/utils/methods';
import configs from 'src/libs/configs/configs';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthLoggingEntity, LoggingType } from './entities/auth-logging.entity';
import { Repository } from 'typeorm';
import { redisUserSlugHashKey } from 'src/libs/utils/redis-constant';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { UserEntity } from '../user/entities/user.entity';
import { RedisTokensUtils } from './utils/redis-tokens.utils';
import { ISignIn } from './interfaces/sign-in.interface';

@Injectable()
export class JwtAccessService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisTokensUtils: RedisTokensUtils,
    @InjectRepository(AuthLoggingEntity)
    private readonly authLoggingRepository: Repository<AuthLoggingEntity>,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  async generateNewToken(
    user: ILoginUser,
    loginMetaDto: RequestMetaData,
    loggingType: LoggingType,
    options: JwtSignOptions = {},
  ) {
    const slug = await this.generateAndStoreSlugForUser(
      user,
      loginMetaDto,
      loggingType,
    );
    const payload: IUserTokenPayload = {
      id: user.id,
      type: user.type,
      slug: slug,
      roleId: user?.role?.id ?? null,
    };

    return await this.jwtService.signAsync(payload, options); // generate a json web token
  }

  async generateAuthenticationData(
    user: UserEntity,
    loginMetaDto: RequestMetaData,
    deviceId: string,
  ): Promise<ISignIn> {
    const accessToken = await this.generateNewToken(
      user,
      loginMetaDto,
      LoggingType.login,
    );

    const refreshToken = await this.generateAndSaveRefreshToken(
      user,
      loginMetaDto,
      accessToken,
      deviceId,
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async generateAndSaveRefreshToken(
    user: UserEntity,
    loginMetaData: RequestMetaData,
    accessToken: string,
    deviceId: string,
  ) {
    const iUser: ILoginUser = {
      id: user.id,
      email: user.email ?? null,
      type: user.type,
      phoneNumber: user.phoneNumber,
      status: user.status,
      role: user.role,
    };

    const refreshToken = await this.generateNewToken(
      iUser,
      loginMetaData,
      LoggingType.refresh_token,
      {
        secret: configs.REFRESH_TOKEN_SECRET,
        expiresIn: configs.REFRESH_TOKEN_EXPIRY as '1',
      },
    );

    await this.redisTokensUtils.saveTokens(
      iUser.id,
      deviceId,
      refreshToken,
      accessToken,
    );

    return refreshToken;
  }

  async generateAndStoreSlugForUser(
    user: ILoginUser,
    loginMetaDto: RequestMetaData,
    loggingType: LoggingType,
  ) {
    // Generate a new slug
    const slug = await this.saveAuthLog(user, loginMetaDto, loggingType);

    if (
      loggingType === LoggingType.login ||
      loggingType === LoggingType.generate_token
    ) {
      const expireIn: number = convertJwtTimeToMilliseconds(
        configs.JWT_EXPIRES_IN,
      );

      // Store the slug in a set for the user
      const redisSet = redisUserSlugHashKey(user.id);
      await this.setSlugForUser(redisSet, slug, expireIn / 1000);
    }

    return slug;
  }

  async saveAuthLog(
    user: ILoginUser,
    loginMetaDto: RequestMetaData,
    loggingType: LoggingType,
  ): Promise<string> {
    const slug: string = uuidv4();

    // add the login operation for the logging table
    const log = this.authLoggingRepository.create({
      userId: user.id,
      uuid: slug,
      type: loggingType,
      ...loginMetaDto,
    });
    await this.authLoggingRepository.insert(log);

    return slug;
  }

  async setSlugForUser(
    slugHashKey: string,
    slug: string,
    expireInSeconds: number,
  ) {
    const pipeline = this.redis.pipeline();

    pipeline.hset(slugHashKey, slug, 1);
    pipeline.call('HEXPIRE', slugHashKey, expireInSeconds, 'FIELDS', 1, slug);

    await pipeline.exec();
  }
}
