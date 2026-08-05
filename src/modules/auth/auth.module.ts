import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import configs from 'src/libs/configs/configs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logging } from './entities/logging.entity';
import { AuthController } from './auth.controller';
import { MobileAuthController } from './mobile-auth.controller';
import { LoggingService } from './logging.service';
import * as jwt from 'jsonwebtoken';
import { UserModule } from '../user/user.module';
import { AuthLoggingEntity } from './entities/auth-logging.entity';
import { RefreshTokenService } from './refresh-token.service';
import { JwtAccessService } from './jwt-access.service';
import { RedisTokensUtils } from './utils/redis-tokens.utils';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: configs.JWT_SECRET,
      signOptions: {
        expiresIn: configs.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      },
    }),
    TypeOrmModule.forFeature([AuthLoggingEntity, Logging]),
  ],
  controllers: [AuthController, MobileAuthController],
  providers: [
    AuthService,
    LoggingService,
    RefreshTokenService,
    JwtAccessService,
    RedisTokensUtils,
  ],
  exports: [
    AuthService,
    LoggingService,
    RefreshTokenService,
    JwtAccessService,
    RedisTokensUtils,
  ],
})
export class AuthModule {}
