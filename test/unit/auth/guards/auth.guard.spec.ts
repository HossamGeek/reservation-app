/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import {
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { AuthService } from 'src/modules/auth/auth.service';
import { REQUEST_USER_KEY } from 'src/libs/constants/global-constants';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;
  let jwtService: JwtService;
  let authService: AuthService;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
    validateTokenSlug: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
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

    guard = module.get<AuthGuard>(AuthGuard);
    reflector = module.get<Reflector>(Reflector);
    jwtService = module.get<JwtService>(JwtService);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
    jest.spyOn(Logger, 'error').mockImplementation(() => {});
  });

  const createMockContext = (req: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  it('should return true if route is public', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);

    const context = createMockContext({
      url: '/any-url',
      headers: {},
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockReflector.getAllAndOverride).toHaveBeenCalled();
  });

  it('should return true if request url is root "/"', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);

    const context = createMockContext({
      url: '/',
      headers: {},
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if authorization header is missing', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);

    const context = createMockContext({
      url: '/protected-url',
      headers: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('auth.errors.tokenRequired'),
    );
  });

  it('should throw UnauthorizedException if authorization scheme is not Bearer', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);

    const context = createMockContext({
      url: '/protected-url',
      headers: {
        authorization: 'Basic dGVzdDp0ZXN0',
      },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('auth.errors.tokenRequired'),
    );
  });

  it('should verify token, validate user, validate slug, set user in request, and return true', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);

    const mockRequest: any = {
      url: '/protected-url',
      headers: {
        authorization: 'Bearer valid-jwt-token',
      },
    };

    const mockPayload = {
      id: 'user-id-123',
      slug: 'slug-abc-123',
    };

    const mockUser = {
      id: 'user-id-123',
      email: 'user@example.com',
      slug: 'slug-abc-123',
    };

    mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
    mockAuthService.validateUser.mockResolvedValue(mockUser);
    mockAuthService.validateTokenSlug.mockResolvedValue(true);

    const context = createMockContext(mockRequest);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
      'valid-jwt-token',
      expect.any(Object),
    );
    expect(mockAuthService.validateUser).toHaveBeenCalledWith(mockPayload);
    expect(mockAuthService.validateTokenSlug).toHaveBeenCalledWith(mockUser);
    expect(mockRequest[REQUEST_USER_KEY]).toEqual(mockUser);
  });

  it('should throw UnauthorizedException and log error if jwt verification throws', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);

    const mockRequest: any = {
      url: '/protected-url',
      headers: {
        authorization: 'Bearer invalid-jwt-token',
      },
    };

    mockJwtService.verifyAsync.mockRejectedValue(
      new Error('Invalid signature'),
    );

    const context = createMockContext(mockRequest);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('auth.errors.invalidToken'),
    );

    expect(Logger.error).toHaveBeenCalled();
  });
});
