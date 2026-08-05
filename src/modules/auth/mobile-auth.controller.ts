import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/libs/decorators/public.decorator';
import { ApiResponse } from 'src/libs/errors/api-response';
import { I18nService } from 'nestjs-i18n';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { EndpointRateLimit } from 'src/libs/decorators/rate-limit.decorator';
import { ClientSignUpDto } from './dto/request/client-sign-up.dto';
import { ClientLoginDto } from './dto/request/client-login.dto';
import { VerifyOtpDto } from './dto/request/verify-otp.dto';
import { DeviceId } from 'src/libs/decorators/device-id.decorator';
import { USER_META } from 'src/libs/decorators/user-meta.data.decorator';
import { RequestMetaData } from './dto/request/login-meta.dto';
import { OTP } from 'src/libs/constants/global-constants';

@Controller('client/auth')
@UseInterceptors(ClassSerializerInterceptor)
export class MobileAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly i18n: I18nService,
  ) {}

  @EndpointRateLimit({ limit: 50, ttl: 60_000 })
  @Public()
  @Post('sign-up')
  @ApiOperation({ summary: 'Client account sign up' })
  @ApiCreatedResponse({
    description: 'Client account created successfully',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Phone number already exists',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
  })
  async signUp(@Body() clientSignUpDto: ClientSignUpDto) {
    await this.authService.signUpClient(clientSignUpDto);

    return ApiResponse.successResponse(
      this.i18n.t('auth.signUp.success'),
      { otp: OTP },
      201,
    );
  }

  @EndpointRateLimit({ limit: 50, ttl: 60_000 })
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Client mobile login' })
  @ApiOkResponse({
    description: 'Logged in successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid phone number or user not found',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
  })
  async login(@Body() clientLoginDto: ClientLoginDto) {
    await this.authService.loginClient(clientLoginDto);

    return ApiResponse.successResponse(
      this.i18n.t('auth.signIn.success'),
      { otp: OTP },
      201,
    );
  }

  @EndpointRateLimit({ limit: 50, ttl: 60_000 })
  @Public()
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify client OTP' })
  @ApiOkResponse({
    description: 'OTP verified successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired OTP',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async verifyOTP(
    @Body() verifyOtpDto: VerifyOtpDto,
    @USER_META() loginMetaDto: RequestMetaData,
    @DeviceId() deviceId: string,
  ) {
    const response = await this.authService.verifyOtp(
      verifyOtpDto,
      loginMetaDto,
      deviceId,
    );

    return ApiResponse.successResponse(
      this.i18n.t('auth.signIn.success'),
      response,
      200,
    );
  }

  @Get('validate-token')
  @ApiOperation({ summary: 'Validate client token' })
  @ApiOkResponse({
    description: 'Token validated successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired token',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async validateToken() {
    return await Promise.resolve(
      ApiResponse.successResponse(this.i18n.t('auth.signIn.success'), {}, 200),
    );
  }
}
