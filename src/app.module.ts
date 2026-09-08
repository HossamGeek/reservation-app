import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './infrastructure/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { RoleModule } from './modules/role/role.module';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { UserModule } from './modules/user/user.module';
import {
  ERPRedisModule,
  redisConfig,
} from './infrastructure/redis/redis.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { AuthModule } from './modules/auth/auth.module';
import { CountryModule } from './modules/country/country.module';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { HttpErrorFilter } from './libs/errors/HttpError.filter';
import envValidationSchema from './libs/configs/validate-config';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { PermissionGuard } from './modules/auth/guards/permission.guard';
import { DEFAULT_LANGUAGE } from './libs/constants/global-constants';
import { DocumentModule } from './modules/document/document.module';
import { CityModule } from './modules/city/city.module';
import { ClientModule } from './modules/client/client.module';
import { NationalityModule } from './modules/nationality/nationality.module';
import { ProviderModule } from './modules/provider/provider.module';
import { BranchModule } from './modules/branch/branch.module';
import { ExperienceModule } from './modules/experience/experience.module';
import { ReligionModule } from './modules/religion/religion.module';
import { PositionModule } from './modules/position/position.module';
import { SkillsModule } from './modules/skills/skills.module';
import { LanguagesModule } from './modules/languages/languages.module';
import { CategoryModule } from './modules/category/category.module';
import { DayModule } from './modules/day/day.module';
import { ShiftModule } from './modules/shifts/shift.module';
import { ServiceModule } from './modules/service/service.module';
import { ReservationsModule } from './modules/reservations/reservations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: 60000,
            limit: 100,
          },
        ],
        storage: new ThrottlerStorageRedisService({
          ...redisConfig,
        }),
      }),
    }),
    BullModule.forRoot({
      redis: {
        ...redisConfig,
      },
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: 60000,
            limit: 100,
          },
        ],
        storage: new ThrottlerStorageRedisService({
          ...redisConfig,
        }),
      }),
    }),
    BullModule.forRoot({
      redis: {
        ...redisConfig,
      },
    }),
    I18nModule.forRoot({
      fallbackLanguage: DEFAULT_LANGUAGE,

      loaderOptions: {
        path: path.join(__dirname, '/i18n'),
        watch: true,
      },

      resolvers: [AcceptLanguageResolver],
    }),
    I18nModule.forRoot({
      fallbackLanguage: DEFAULT_LANGUAGE,

      loaderOptions: {
        path: path.join(__dirname, '/i18n'),
        watch: true,
      },

      resolvers: [AcceptLanguageResolver],
    }),
    DatabaseModule,
    ERPRedisModule,
    RoleModule,
    UserModule,
    AuthModule,
    CountryModule,
    DocumentModule,
    CityModule,
    ClientModule,
    NationalityModule,
    ProviderModule,
    BranchModule,
    ExperienceModule,
    ReligionModule,
    PositionModule,
    SkillsModule,
    LanguagesModule,
    CategoryModule,
    DayModule,
    ShiftModule,
    ServiceModule,
    ReservationsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
  ],
})
export class AppModule {}
