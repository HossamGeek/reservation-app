import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/request/sign-in.dto';
import { Public } from 'src/libs/decorators/public.decorator';
import { ApiResponse } from 'src/libs/errors/api-response';
import { CurrentUser } from 'src/libs/decorators/current-user.decorator';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { I18nService } from 'nestjs-i18n';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EndpointRateLimit } from 'src/libs/decorators/rate-limit.decorator';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { RequestMetaData } from './dto/request/login-meta.dto';
import { USER_META } from 'src/libs/decorators/user-meta.data.decorator';
import { DeviceId } from 'src/libs/decorators/device-id.decorator';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly i18n: I18nService,
  ) {}

  @EndpointRateLimit({ limit: 50, ttl: 60_000 })
  @Public()
  @Post('admin/sign-in')
  @ApiOperation({ summary: 'Admin sign in' })
  @ApiOkResponse({
    description: 'Logged in successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials (email or password is incorrect)',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
  })
  async adminSignIn(
    @Body() signInDto: SignInDto,
    @USER_META() loginMetaDto: RequestMetaData,
    @DeviceId() deviceId: string,
  ) {
    const data = await this.authService.signIn(
      signInDto,
      loginMetaDto,
      deviceId,
      UserTypeEnum.ADMIN,
    );

    return ApiResponse.successResponse(
      this.i18n.t('auth.signIn.success'),
      { data },
      200,
    );
  }

  @EndpointRateLimit({ limit: 50, ttl: 60_000 })
  @Public()
  @Post('provider/sign-in')
  @ApiOperation({ summary: 'Provider sign in' })
  @ApiOkResponse({
    description: 'Logged in successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials (email or password is incorrect)',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
  })
  async providerSignIn(
    @Body() signInDto: SignInDto,
    @USER_META() loginMetaDto: RequestMetaData,
    @DeviceId() deviceId: string,
  ) {
    const data = await this.authService.signIn(
      signInDto,
      loginMetaDto,
      deviceId,
      UserTypeEnum.PROVIDER,
    );

    return ApiResponse.successResponse(
      this.i18n.t('auth.signIn.success'),
      { data },
      200,
    );
  }

  @EndpointRateLimit({ limit: 10, ttl: 60_000 })
  @Post('refresh-token')
  @Public()
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @CurrentUser() user: ILoginUser,
    @USER_META() loginMetaData: RequestMetaData,
    @DeviceId() deviceId: string,
  ) {
    const data = await this.authService.refreshToken(
      user,
      loginMetaData,
      deviceId,
    );

    return ApiResponse.successResponse('Refreshed successfully', { data }, 200);
  }

  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Sign out the current user' })
  @ApiOkResponse({ description: 'Logged out successfully' })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired access token',
  })
  @Post('sign-out')
  async signOut(
    @CurrentUser() user: ILoginUser,
    @USER_META() userMetaDto: RequestMetaData,
    @DeviceId() deviceId: string,
  ) {
    await this.authService.signOut(user, userMetaDto, deviceId);

    return ApiResponse.successResponse('Logged out successfully', {}, 200);
  }
}
