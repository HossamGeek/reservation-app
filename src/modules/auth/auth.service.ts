import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import configs from 'src/libs/configs/configs';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthLoggingEntity, LoggingType } from './entities/auth-logging.entity';
import { DataSource, FindOptionsRelations, In, Repository } from 'typeorm';
import { SignInDto } from './dto/request/sign-in.dto';
import { comparePasswords } from 'src/libs/utils/bcrypt';
import { RequestMetaData } from './dto/request/login-meta.dto';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { redisUserSlugHashKey } from 'src/libs/utils/redis-constant';
import { IUserTokenPayload } from 'src/libs/interfaces/user-token-payload.interface';
import { I18nService } from 'nestjs-i18n';
import { RefreshTokenService } from './refresh-token.service';
import { JwtAccessService } from './jwt-access.service';
import { convertJwtTimeToMilliseconds } from 'src/libs/utils/methods';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { UserStatusEnum } from 'src/libs/enums/user-status.enum';
import { ClientEntity } from 'src/modules/client/entities/client.entity';
import { ClientSignUpDto } from './dto/request/client-sign-up.dto';
import { ClientLoginDto } from './dto/request/client-login.dto';
import { VerifyOtpDto } from './dto/request/verify-otp.dto';
import { OTP } from 'src/libs/constants/global-constants';
import { SignInResponseDto } from './dto/respose/sign-in-user.response.dto';
import { UserMapper } from 'src/libs/mappers/user.mapper';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtAccessService: JwtAccessService,
    private readonly refreshTokenService: RefreshTokenService,
    @InjectRepository(AuthLoggingEntity)
    private readonly authLoggingRepository: Repository<AuthLoggingEntity>,
    @InjectRedis() private readonly redis: Redis,
    private readonly i18n: I18nService,
    private readonly dataSource: DataSource,
  ) {}

  async signIn(
    signInDto: SignInDto,
    loginMetaDto: RequestMetaData,
    deviceId: string,
    userType: UserTypeEnum,
  ): Promise<SignInResponseDto> {
    const user = await this.validatePassword(signInDto, userType);
    const data = await this.jwtAccessService.generateAuthenticationData(
      user,
      loginMetaDto,
      deviceId,
    );

    return { ...data, user: UserMapper.toResponse(user) };
  }

  async signUpClient(dto: ClientSignUpDto): Promise<void> {
    const existUser = await this.userService.findOneBy({
      where: { phoneNumber: dto.phoneNumber, type: UserTypeEnum.CLIENT },
    });

    if (existUser) {
      throw new UnprocessableEntityException({
        message: this.i18n.t('users.phoneAlreadyExists'),
        fields: ['phoneNumber'],
      });
    }

    await this.dataSource.transaction(async (entityManager) => {
      const user = entityManager.create(UserEntity, {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        type: UserTypeEnum.CLIENT,
        status: UserStatusEnum.ACTIVE,
      });

      const saved = await entityManager.save(UserEntity, user);

      const client = entityManager.create(ClientEntity, {
        userId: saved.id,
      });
      await entityManager.save(ClientEntity, client);

      return saved;
    });
  }

  async loginClient(dto: ClientLoginDto): Promise<void> {
    const user = await this.userService.findOneBy({
      where: { phoneNumber: dto.phoneNumber, type: UserTypeEnum.CLIENT },
      relations: { client: true },
    });

    if (!user) {
      throw new UnauthorizedException(
        this.i18n.t('auth.signIn.invalidCredentials'),
      );
    }

    // await this.jwtAccessService.generateAuthenticationData(
    //   user,
    //   loginMetaDto,
    //   deviceId,
    // );
  }

  private async validatePassword(
    signInDto: SignInDto,
    userType: UserTypeEnum,
  ): Promise<UserEntity> {
    const user = await this.userService.findOneBy({
      where: { email: signInDto.email, type: userType },
      relations: {
        role: true,
        ...(userType !== UserTypeEnum.ADMIN && { providerAdmin: true }),
      },
    });

    if (
      !user ||
      !user.password ||
      !comparePasswords(signInDto.password, user.password)
    ) {
      throw new UnauthorizedException(
        this.i18n.t('auth.signIn.invalidCredentials'),
      );
    }

    return user;
  }

  async isSlugExistsInRedis(
    slugHashKey: string,
    slug: string,
  ): Promise<boolean> {
    const results = await this.redis.hexists(slugHashKey, slug);

    return results === 1;
  }

  async validateTokenSlug(user: IUserTokenPayload): Promise<boolean> {
    const { slug, id } = user;

    // check if the slug exists in the redis set for that user
    const redisSet = redisUserSlugHashKey(id);
    const exists = await this.isSlugExistsInRedis(redisSet, slug);

    if (exists) {
      return true;
    }

    // check if the slug exists in the logging table
    const log = await this.authLoggingRepository.existsBy({
      type: In([LoggingType.login, LoggingType.generate_token]),
      userId: id,
      uuid: slug,
    });

    if (log) {
      await this.jwtAccessService.setSlugForUser(
        redisSet,
        slug,
        convertJwtTimeToMilliseconds(configs.JWT_EXPIRES_IN) / 1000,
      );
      return true;
    }

    throw new UnauthorizedException(this.i18n.t('auth.errors.invalidSlug'));
  }

  async signOut(
    iuser: ILoginUser,
    userMetaData: RequestMetaData,
    deviceId: string,
  ) {
    await this.revokeMyRefreshToken(iuser, userMetaData, deviceId);

    const { slug, id } = iuser;

    if (slug) {
      // remove the slug from redis
      const redisSet = redisUserSlugHashKey(id);
      await this.redis.hdel(redisSet, slug);

      // remove the slug log from the logging table
      await this.authLoggingRepository.delete({
        type: In([LoggingType.login, LoggingType.generate_token]),
        userId: id,
        uuid: slug,
      });
    }
  }

  async revokeMyRefreshToken(
    iuser: ILoginUser,
    loginMetaData: RequestMetaData,
    deviceId?: string,
  ) {
    return await this.refreshTokenService.revokeMyRefreshToken(
      iuser,
      loginMetaData,
      deviceId,
    );
  }

  async validateUser(tokenPayload: IUserTokenPayload): Promise<ILoginUser> {
    const relations: FindOptionsRelations<UserEntity> = { role: true };

    // TODO: Handle this once the structure is complete.
    switch (tokenPayload.type) {
      case UserTypeEnum.ADMIN:
        relations.systemAdmin = true;
        break;

      case UserTypeEnum.PROVIDER:
        relations.providerAdmin = true;
        break;

      case UserTypeEnum.CLIENT:
        relations.client = true;
        break;

      case UserTypeEnum.WORKER:
        relations.worker = true;
    }

    const user = await this.userService.findOneBy({
      where: { id: tokenPayload.id },
      relations,
    });

    if (!user) {
      throw new UnauthorizedException(this.i18n.t('auth.errors.userNotFound'));
    }

    return {
      id: user.id,
      email: user.email ?? null,
      phoneNumber: user.phoneNumber,
      type: user.type,
      status: user.status,

      systemAdmin: user.systemAdmin ?? null,
      providerAdmin: user.providerAdmin ?? null,
      client: user.client ?? null,
      
      role: user.role ?? null,
      slug: tokenPayload.slug,
    };
  }

  async validateRefreshToken(
    token: string,
    metaData: RequestMetaData,
    deviceId: string,
  ) {
    if (!token) {
      throw new UnauthorizedException(
        this.i18n.t('auth.errors.refreshTokenRequired'),
      );
    }

    return await this.refreshTokenService.validateRefreshToken(
      token,
      metaData,
      deviceId,
    );
  }

  async refreshToken(
    user: ILoginUser,
    loginMetaData: RequestMetaData,
    deviceId: string,
  ) {
    return await this.refreshTokenService.refreshToken(
      user,
      loginMetaData,
      deviceId,
    );
  }

  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
    loginMetaDto: RequestMetaData,
    deviceId: string,
  ): Promise<SignInResponseDto> {
    const user = await this.userService.findOneBy({
      where: {
        phoneNumber: verifyOtpDto.phoneNumber,
        type: UserTypeEnum.CLIENT,
      },
      relations: { client: { addresses: true } },
    });

    if (!user) {
      throw new UnauthorizedException(
        this.i18n.t('auth.signIn.unregisteredPhoneNumber'),
      );
    }

    const isOtpValid = await this.validateOTP(
      verifyOtpDto.otp,
      user.phoneNumber,
    );

    if (!isOtpValid) {
      throw new UnauthorizedException(this.i18n.t('auth.signIn.invalidOtp'));
    }

    const data = await this.jwtAccessService.generateAuthenticationData(
      user,
      loginMetaDto,
      deviceId,
    );

    return { ...data, user: UserMapper.toResponse(user) };
  }

  private async validateOTP(
    otp: number,
    phoneNumber: string,
  ): Promise<boolean> {
    // Implement your OTP validation logic here
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(phoneNumber !== null && otp === OTP);
      }, 100);
    });
  }
}
