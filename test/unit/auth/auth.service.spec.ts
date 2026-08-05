/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import {
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserService } from 'src/modules/user/user.service';
import {
  AuthLoggingEntity,
  LoggingType,
} from 'src/modules/auth/entities/auth-logging.entity';
import { SignInDto } from 'src/modules/auth/dto/request/sign-in.dto';
import { RequestMetaData } from 'src/modules/auth/dto/request/login-meta.dto';
import { comparePasswords } from 'src/libs/utils/bcrypt';
import { JwtAccessService } from 'src/modules/auth/jwt-access.service';
import { RefreshTokenService } from 'src/modules/auth/refresh-token.service';
import { DataSource, In } from 'typeorm';
import { ClientSignUpDto } from 'src/modules/auth/dto/request/client-sign-up.dto';
import { ClientLoginDto } from 'src/modules/auth/dto/request/client-login.dto';
import { VerifyOtpDto } from 'src/modules/auth/dto/request/verify-otp.dto';
import { OTP } from 'src/libs/constants/global-constants';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';

jest.mock('src/libs/utils/bcrypt', () => ({
  comparePasswords: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    findOneBy: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockAuthLoggingRepository = {
    create: jest.fn((x) => x),
    save: jest.fn(),
    existsBy: jest.fn(),
    delete: jest.fn(),
  };

  const mockPipeline = {
    hset: jest.fn().mockReturnThis(),
    call: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockRedis = {
    pipeline: jest.fn(() => mockPipeline),
    hexists: jest.fn(),
    hdel: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  const mockJwtAccessService = {
    generateAuthenticationData: jest.fn(),
    setSlugForUser: jest.fn(),
  };

  const mockRefreshTokenService = {
    revokeMyRefreshToken: jest.fn(),
  };

  const mockEntityManager = {
    findOne: jest.fn(),
    create: jest.fn((entity, val) => val),
    save: jest.fn((entity, val) => {
      const target = val || entity;
      if (target && typeof target === 'object' && target.firstName) {
        target.id = 'user-id-123';
      }
      return Promise.resolve(target);
    }),
  };

  const mockDataSource = {
    transaction: jest.fn((cb) => cb(mockEntityManager)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(AuthLoggingEntity),
          useValue: mockAuthLoggingRepository,
        },
        {
          provide: getRedisConnectionToken(),
          useValue: mockRedis,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
        {
          provide: JwtAccessService,
          useValue: mockJwtAccessService,
        },
        {
          provide: RefreshTokenService,
          useValue: mockRefreshTokenService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should successfully sign in an admin and return token & user details', async () => {
      const signInDto: SignInDto = {
        email: 'admin@example.com',
        password: 'password123',
      };
      const loginMetaDto: RequestMetaData = {
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };
      const deviceId = 'device-id';

      const user = {
        id: 'user-id-123',
        email: 'admin@example.com',
        password: 'hashedPassword',
        firstName: 'Admin',
        lastName: 'User',
        type: UserTypeEnum.ADMIN,
        status: 'active',
        phoneNumber: '+966500000000',
        image: null,
        createdAt: new Date('2024-01-01'),
        role: { id: 'role-id-999' },
      } as any;

      const mockAuthResponse = {
        accessToken: 'jwt-token-abc',
        refreshToken: 'refresh-token-abc',
      };

      mockUserService.findOneBy.mockResolvedValue(user);
      (comparePasswords as jest.Mock).mockReturnValue(true);
      mockJwtAccessService.generateAuthenticationData.mockResolvedValue(
        mockAuthResponse,
      );

      const result = await service.signIn(
        signInDto,
        loginMetaDto,
        deviceId,
        UserTypeEnum.ADMIN,
      );

      expect(mockUserService.findOneBy).toHaveBeenCalledWith({
        where: { email: 'admin@example.com', type: UserTypeEnum.ADMIN },
        relations: { role: true },
      });
      expect(comparePasswords).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
      expect(
        mockJwtAccessService.generateAuthenticationData,
      ).toHaveBeenCalledWith(user, loginMetaDto, deviceId);
      expect(result).toEqual({
        ...mockAuthResponse,
        user: {
          id: 'user-id-123',
          firstName: 'Admin',
          lastName: 'User',
          type: UserTypeEnum.ADMIN,
          status: 'active',
          phoneNumber: '+966500000000',
          isVerified: true,
          createdAt: user.createdAt,
          image: null,
          role: { id: 'role-id-999' },
        },
      });
    });

    it('should successfully sign in a provider and return token & user details', async () => {
      const signInDto: SignInDto = {
        email: 'provider@example.com',
        password: 'password123',
      };
      const loginMetaDto: RequestMetaData = {
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };
      const deviceId = 'device-id';

      const user = {
        id: 'user-id-456',
        email: 'provider@example.com',
        password: 'hashedPassword',
        firstName: 'Provider',
        lastName: 'Owner',
        type: UserTypeEnum.PROVIDER,
        status: 'active',
        phoneNumber: '+966500000001',
        image: null,
        createdAt: new Date('2024-01-01'),
        role: { id: 'role-id-999' },
        providerAdmin: { id: 'provider-admin-id', providerId: 'provider-1' },
      } as any;

      const mockAuthResponse = {
        accessToken: 'jwt-token-xyz',
        refreshToken: 'refresh-token-xyz',
      };

      mockUserService.findOneBy.mockResolvedValue(user);
      (comparePasswords as jest.Mock).mockReturnValue(true);
      mockJwtAccessService.generateAuthenticationData.mockResolvedValue(
        mockAuthResponse,
      );

      const result = await service.signIn(
        signInDto,
        loginMetaDto,
        deviceId,
        UserTypeEnum.PROVIDER,
      );

      expect(mockUserService.findOneBy).toHaveBeenCalledWith({
        where: { email: 'provider@example.com', type: UserTypeEnum.PROVIDER },
        relations: { role: true, providerAdmin: true },
      });
      expect(comparePasswords).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
      expect(
        mockJwtAccessService.generateAuthenticationData,
      ).toHaveBeenCalledWith(user, loginMetaDto, deviceId);
      expect(result).toEqual({
        ...mockAuthResponse,
        user: {
          id: 'user-id-456',
          firstName: 'Provider',
          lastName: 'Owner',
          type: UserTypeEnum.PROVIDER,
          status: 'active',
          phoneNumber: '+966500000001',
          isVerified: true,
          createdAt: user.createdAt,
          image: null,
          providerId: 'provider-1',
          role: { id: 'role-id-999' },
        },
      });
    });

    it('should throw UnauthorizedException if password verification fails', async () => {
      const signInDto: SignInDto = {
        email: 'user@example.com',
        password: 'wrongPassword',
      };
      const loginMetaDto: RequestMetaData = {
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };
      const deviceId = 'device-id';

      const user = {
        id: 'user-id-123',
        email: 'user@example.com',
        password: 'hashedPassword',
      } as any;

      mockUserService.findOneBy.mockResolvedValue(user);
      (comparePasswords as jest.Mock).mockReturnValue(false);

      await expect(
        service.signIn(signInDto, loginMetaDto, deviceId, UserTypeEnum.ADMIN),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user email is not found', async () => {
      const signInDto: SignInDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };
      const loginMetaDto: RequestMetaData = {
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };
      const deviceId = 'device-id';

      mockUserService.findOneBy.mockResolvedValue(null);

      await expect(
        service.signIn(
          signInDto,
          loginMetaDto,
          deviceId,
          UserTypeEnum.PROVIDER,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signUpClient', () => {
    it('should successfully sign up a client and generate token data', async () => {
      const signUpDto: ClientSignUpDto = {
        firstName: 'Ahmed',
        lastName: 'Hassan',
        phoneNumber: '+966504545432',
      };

      // Mock first findOneBy: phone availability (should return null)
      mockUserService.findOneBy.mockResolvedValueOnce(null);

      // Mock transaction findOne for Client role
      mockEntityManager.findOne.mockResolvedValue({
        id: 'role-client-id',
        name: 'Client',
      });

      // Mock transaction saves
      mockEntityManager.save.mockImplementation((entity, val) => {
        const target = val || entity;
        if (target && typeof target === 'object' && target.firstName) {
          target.id = 'user-id-123';
        }
        return Promise.resolve(target);
      });

      const result = await service.signUpClient(signUpDto);

      expect(mockUserService.findOneBy).toHaveBeenCalledWith({
        where: {
          phoneNumber: signUpDto.phoneNumber,
          type: UserTypeEnum.CLIENT,
        },
      });
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should throw UnprocessableEntityException (422) if phone number already exists', async () => {
      const signUpDto: ClientSignUpDto = {
        firstName: 'Ahmed',
        lastName: 'Hassan',
        phoneNumber: '+966504545432',
      };

      const existingUser = {
        id: 'existing-id',
        phoneNumber: signUpDto.phoneNumber,
      } as any;

      mockUserService.findOneBy.mockResolvedValue(existingUser);

      await expect(service.signUpClient(signUpDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('loginClient', () => {
    it('should successfully log in a client and return token details', async () => {
      const loginDto: ClientLoginDto = {
        phoneNumber: '+966504545432',
      };

      const user = {
        id: 'user-id-123',
        phoneNumber: '+966504545432',
        type: 'client',
        client: { id: 'client-profile-id' },
      } as any;

      mockUserService.findOneBy.mockResolvedValue(user);

      const result = await service.loginClient(loginDto);

      expect(mockUserService.findOneBy).toHaveBeenCalledWith({
        where: {
          phoneNumber: loginDto.phoneNumber,
          type: UserTypeEnum.CLIENT,
        },
        relations: { client: true },
      });
      expect(result).toBeUndefined();
    });

    it('should throw UnauthorizedException if client user does not exist', async () => {
      const loginDto: ClientLoginDto = {
        phoneNumber: '+966504545432',
      };
      mockUserService.findOneBy.mockResolvedValue(null);

      await expect(service.loginClient(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if no client exists for the phone number', async () => {
      const loginDto: ClientLoginDto = {
        phoneNumber: '+966504545432',
      };

      // Query is scoped to type CLIENT, so a provider/admin with the same
      // phone number is not returned.
      mockUserService.findOneBy.mockResolvedValue(null);

      await expect(service.loginClient(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockUserService.findOneBy).toHaveBeenCalledWith({
        where: {
          phoneNumber: loginDto.phoneNumber,
          type: UserTypeEnum.CLIENT,
        },
        relations: { client: true },
      });
    });
  });

  describe('verifyOtp', () => {
    it('should successfully verify OTP and return token details', async () => {
      const verifyOtpDto: VerifyOtpDto = {
        phoneNumber: '+966504545432',
        otp: OTP,
      };
      const loginMetaDto: RequestMetaData = {
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };
      const deviceId = 'device-id';

      const user = {
        id: 'user-id-123',
        phoneNumber: '+966504545432',
        type: 'client',
        firstName: 'Ahmed',
        lastName: 'Hassan',
        status: 'active',
        createdAt: new Date('2024-01-01'),
        client: { id: 'client-profile-id', addresses: [] },
      } as any;

      const mockAuthResponse = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
      };

      mockUserService.findOneBy.mockResolvedValue(user);
      mockJwtAccessService.generateAuthenticationData.mockResolvedValue(
        mockAuthResponse,
      );

      const result = await service.verifyOtp(
        verifyOtpDto,
        loginMetaDto,
        deviceId,
      );

      expect(mockUserService.findOneBy).toHaveBeenCalledWith({
        where: {
          phoneNumber: verifyOtpDto.phoneNumber,
          type: UserTypeEnum.CLIENT,
        },
        relations: { client: { addresses: true } },
      });
      expect(
        mockJwtAccessService.generateAuthenticationData,
      ).toHaveBeenCalledWith(user, loginMetaDto, deviceId);
      expect(result).toEqual({
        ...mockAuthResponse,
        user: {
          id: 'user-id-123',
          firstName: 'Ahmed',
          lastName: 'Hassan',
          type: 'client',
          status: 'active',
          phoneNumber: '+966504545432',
          isVerified: true,
          createdAt: user.createdAt,
          address: null,
        },
      });
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      const verifyOtpDto: VerifyOtpDto = {
        phoneNumber: '+966504545432',
        otp: OTP,
      };
      const loginMetaDto: RequestMetaData = {
        ipAddress: '127.0.0.15',
        userAgent: 'Mozilla/5.0',
      };
      const deviceId = 'device-id';

      mockUserService.findOneBy.mockResolvedValue(null);
      await expect(
        service.verifyOtp(verifyOtpDto, loginMetaDto, deviceId),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if OTP is invalid', async () => {
      const verifyOtpDto: VerifyOtpDto = {
        phoneNumber: '+966504545432',
        otp: 123456, 
      };
      const loginMetaDto: RequestMetaData = {
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };
      const deviceId = 'device-id';

      const user = {
        id: 'user-id-123',
        phoneNumber: '+966504545432',
        type: 'client',
        client: { id: 'client-profile-id' },
      } as any;

      mockUserService.findOneBy.mockResolvedValue(user);

      await expect(
        service.verifyOtp(verifyOtpDto, loginMetaDto, deviceId),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateTokenSlug', () => {
    const payload = {
      id: 'user-id-123',
      type: 'user-type',
      slug: 'slug-abc-123',
      roleId: 'role-id-999',
    } as any;

    it('should return true if slug exists in redis', async () => {
      mockRedis.hexists.mockResolvedValue(1);

      const result = await service.validateTokenSlug(payload);

      expect(result).toBe(true);
      expect(mockRedis.hexists).toHaveBeenCalled();
    });

    it('should query DB and return true if slug exists in DB, and write to Redis', async () => {
      mockRedis.hexists.mockResolvedValue(0);
      mockAuthLoggingRepository.existsBy.mockResolvedValue(true);
      mockPipeline.exec.mockResolvedValue(null);

      const result = await service.validateTokenSlug(payload);

      expect(result).toBe(true);
      expect(mockAuthLoggingRepository.existsBy).toHaveBeenCalledWith({
        type: In([LoggingType.login, LoggingType.generate_token]),
        userId: 'user-id-123',
        uuid: 'slug-abc-123',
      });
    });

    it('should throw UnauthorizedException if slug does not exist in redis or DB', async () => {
      mockRedis.hexists.mockResolvedValue(0);
      mockAuthLoggingRepository.existsBy.mockResolvedValue(false);

      await expect(service.validateTokenSlug(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('signOut', () => {
    it('should delete token slug from redis and DB logs', async () => {
      const user = {
        id: 'user-id-123',
        slug: 'slug-abc-123',
      } as any;
      const mockMeta: RequestMetaData = {
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };
      const deviceId = 'device-id';

      mockRedis.hdel.mockResolvedValue(1);
      mockAuthLoggingRepository.delete.mockResolvedValue({} as any);
      mockRefreshTokenService.revokeMyRefreshToken.mockResolvedValue(undefined);

      await service.signOut(user, mockMeta, deviceId);

      expect(mockRedis.hdel).toHaveBeenCalled();
      expect(mockAuthLoggingRepository.delete).toHaveBeenCalledWith({
        type: In([LoggingType.login, LoggingType.generate_token]),
        userId: 'user-id-123',
        uuid: 'slug-abc-123',
      });
    });
  });

  describe('validateUser', () => {
    it('should return user info when user exists', async () => {
      const payload = {
        id: 'user-id-123',
        slug: 'slug-abc-123',
        type: 'client',
      } as any;

      const user = {
        id: 'user-id-123',
        email: 'user@example.com',
        phoneNumber: '123456789',
        type: 'client',
        status: 'active',
        role: { id: 'role-999' },
      };

      mockUserService.findOneBy.mockResolvedValue(user);

      const result = await service.validateUser(payload);

      expect(mockUserService.findOneBy).toHaveBeenCalledWith({
        where: { id: 'user-id-123' },
        relations: { role: true, client: true },
      });
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        type: user.type,
        status: user.status,
        role: user.role,
        slug: payload.slug,
        systemAdmin: null,
        providerAdmin: null,
        client: null,
      });
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      const payload = {
        id: 'nonexistent-user',
        slug: 'slug-abc-123',
        type: 'client',
      } as any;

      mockUserService.findOneBy.mockResolvedValue(null);

      await expect(service.validateUser(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
