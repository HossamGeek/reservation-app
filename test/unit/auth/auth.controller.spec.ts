import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { I18nService } from 'nestjs-i18n';
import { ApiResponse } from 'src/libs/errors/api-response';
import { SignInDto } from 'src/modules/auth/dto/request/sign-in.dto';
import { RequestMetaData } from 'src/modules/auth/dto/request/login-meta.dto';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signIn: jest.fn(),
    signOut: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('adminSignIn', () => {
    it('should sign in admin successfully and return ApiResponse', async () => {
      const signInDto: SignInDto = {
        email: 'admin@example.com',
        password: 'password123',
      };
      const ip = '127.0.0.1';
      const mockMeta: RequestMetaData = {
        ipAddress: ip,
        userAgent: 'Mozilla/5.0',
      };
      const deviceId = 'device-id';

      const mockResponse = {
        user: { id: '1', email: 'admin@example.com' },
        token: 'jwt-token',
      };

      mockAuthService.signIn.mockResolvedValue(mockResponse);

      const result = await controller.adminSignIn(signInDto, mockMeta, deviceId);

      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        signInDto,
        mockMeta,
        deviceId,
        UserTypeEnum.ADMIN,
      );
      expect(mockI18n.t).toHaveBeenCalledWith('auth.signIn.success');
      expect(result).toEqual(
        ApiResponse.successResponse(
          'auth.signIn.success',
          { data: mockResponse },
          200,
        ),
      );
    });
  });

  describe('providerSignIn', () => {
    it('should sign in provider successfully and return ApiResponse', async () => {
      const signInDto: SignInDto = {
        email: 'provider@example.com',
        password: 'password123',
      };
      const ip = '127.0.0.1';
      const mockMeta: RequestMetaData = {
        ipAddress: ip,
        userAgent: 'Mozilla/5.0',
      };
      const deviceId = 'device-id';

      const mockResponse = {
        user: { id: '2', email: 'provider@example.com' },
        token: 'jwt-token',
      };

      mockAuthService.signIn.mockResolvedValue(mockResponse);

      const result = await controller.providerSignIn(signInDto, mockMeta, deviceId);

      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        signInDto,
        mockMeta,
        deviceId,
        UserTypeEnum.PROVIDER,
      );
      expect(mockI18n.t).toHaveBeenCalledWith('auth.signIn.success');
      expect(result).toEqual(
        ApiResponse.successResponse(
          'auth.signIn.success',
          { data: mockResponse },
          200,
        ),
      );
    });
  });

  describe('signOut', () => {
    it('should sign out successfully and return ApiResponse', async () => {
      const mockUser = {
        id: 'user-id-123',
        slug: 'slug-abc-123',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      const mockMeta: RequestMetaData = {
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };
      const deviceId = 'device-id';

      mockAuthService.signOut.mockResolvedValue(undefined);

      const result = await controller.signOut(mockUser, mockMeta, deviceId);

      expect(mockAuthService.signOut).toHaveBeenCalledWith(
        mockUser,
        mockMeta,
        deviceId,
      );
      expect(result).toEqual(
        ApiResponse.successResponse('Logged out successfully', {}, 200),
      );
    });
  });
});
