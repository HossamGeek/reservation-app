import { Test, TestingModule } from '@nestjs/testing';
import { MobileAuthController } from 'src/modules/auth/mobile-auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { I18nService } from 'nestjs-i18n';
import { ApiResponse } from 'src/libs/errors/api-response';
import { ClientSignUpDto } from 'src/modules/auth/dto/request/client-sign-up.dto';
import { ClientLoginDto } from 'src/modules/auth/dto/request/client-login.dto';
import { VerifyOtpDto } from 'src/modules/auth/dto/request/verify-otp.dto';
import { RequestMetaData } from 'src/modules/auth/dto/request/login-meta.dto';
import { OTP } from 'src/libs/constants/global-constants';

describe('MobileAuthController', () => {
  let controller: MobileAuthController;

  const mockAuthService = {
    signUpClient: jest.fn(),
    loginClient: jest.fn(),
    verifyOtp: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MobileAuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    controller = module.get<MobileAuthController>(MobileAuthController);
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should sign up client successfully and return ApiResponse', async () => {
      const clientSignUpDto: ClientSignUpDto = {
        firstName: 'Ahmed',
        lastName: 'Hassan',
        phoneNumber: '+966504545432',
      };

      mockAuthService.signUpClient.mockResolvedValue(undefined);

      const result = await controller.signUp(clientSignUpDto);

      expect(mockAuthService.signUpClient).toHaveBeenCalledWith(
        clientSignUpDto,
      );
      expect(mockI18n.t).toHaveBeenCalledWith('auth.signUp.success');
      expect(result).toEqual(
        ApiResponse.successResponse('auth.signUp.success', { otp: OTP }, 201),
      );
    });
  });

  describe('login', () => {
    it('should log in client successfully and return ApiResponse', async () => {
      const clientLoginDto: ClientLoginDto = {
        phoneNumber: '+966504545432',
      };

      mockAuthService.loginClient.mockResolvedValue(undefined);

      const result = await controller.login(clientLoginDto);

      expect(mockAuthService.loginClient).toHaveBeenCalledWith(clientLoginDto);
      expect(mockI18n.t).toHaveBeenCalledWith('auth.signIn.success');
      expect(result).toEqual(
        ApiResponse.successResponse('auth.signIn.success', { otp: OTP }, 201),
      );
    });
  });

  describe('verifyOTP', () => {
    it('should verify otp successfully and return ApiResponse', async () => {
      const verifyOtpDto: VerifyOtpDto = {
        phoneNumber: '+966504545432',
        otp: 123456,
      };
      const loginMetaDto: RequestMetaData = {
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };
      const deviceId = 'device-id';
      const mockResponse = {
        user: { id: '1', phoneNumber: '+966504545432' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.verifyOtp.mockResolvedValue(mockResponse);

      const result = await controller.verifyOTP(
        verifyOtpDto,
        loginMetaDto,
        deviceId,
      );

      expect(mockAuthService.verifyOtp).toHaveBeenCalledWith(
        verifyOtpDto,
        loginMetaDto,
        deviceId,
      );
      expect(mockI18n.t).toHaveBeenCalledWith('auth.signIn.success');
      expect(result).toEqual(
        ApiResponse.successResponse('auth.signIn.success', mockResponse, 200),
      );
    });
  });
});
