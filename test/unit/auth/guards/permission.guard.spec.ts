import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { LoggingService } from 'src/modules/auth/logging.service';
import { REQUEST_USER_KEY } from 'src/libs/constants/global-constants';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let reflector: Reflector;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let loggingService: LoggingService;

  const mockReflector = {
    get: jest.fn(),
  };

  const mockLoggingService = {
    addLog: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    guard = module.get<PermissionGuard>(PermissionGuard);
    reflector = module.get<Reflector>(Reflector);
    loggingService = module.get<LoggingService>(LoggingService);

    jest.clearAllMocks();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createMockContext = (req: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  it('should return true if route is public', () => {
    mockReflector.get.mockReturnValueOnce(true); // isPublic is true

    const context = createMockContext({
      url: '/public-url',
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockReflector.get).toHaveBeenCalledTimes(1);
  });

  it('should return true if entityType metadata is missing', () => {
    mockReflector.get
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(undefined) // entityType
      .mockReturnValueOnce(ActionsEnum.create); // action

    const context = createMockContext({
      url: '/any-url',
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return true if action metadata is missing', () => {
    mockReflector.get
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(CategoriesEnum.users) // entityType
      .mockReturnValueOnce(undefined); // action

    const context = createMockContext({
      url: '/any-url',
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return true and call addLog with authorized: true if user has required permissions', () => {
    mockReflector.get
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(CategoriesEnum.users) // entityType
      .mockReturnValueOnce(ActionsEnum.create); // action

    const mockUser = {
      id: 'user-123',
      slug: 'slug-123',
      role: {
        permissions: {
          [CategoriesEnum.users]: {
            [ActionsEnum.create]: true,
          },
        },
      },
    };

    const mockRequest = {
      [REQUEST_USER_KEY]: mockUser,
      ip: '192.168.1.1',
      body: { name: 'New User' },
      params: { id: 'some-id' },
    };

    const context = createMockContext(mockRequest);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockLoggingService.addLog).toHaveBeenCalledWith({
      actionableEntity: CategoriesEnum.users,
      action: ActionsEnum.create,
      slug: 'slug-123',
      ip: '192.168.1.1',
      userId: 'user-123',
      authorized: true,
      body: { name: 'New User' },
      params: { id: 'some-id' },
      actionableId: 'some-id',
    });
  });

  it('should throw ForbiddenException and call addLog with authorized: false if user does not have permission', () => {
    mockReflector.get
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(CategoriesEnum.users) // entityType
      .mockReturnValueOnce(ActionsEnum.create); // action

    const mockUser = {
      id: 'user-123',
      slug: 'slug-123',
      role: {
        permissions: {
          [CategoriesEnum.users]: {
            [ActionsEnum.create]: false,
          },
        },
      },
    };

    const mockRequest = {
      [REQUEST_USER_KEY]: mockUser,
      ip: '192.168.1.1',
      body: { name: 'New User' },
      params: {},
    };

    const context = createMockContext(mockRequest);

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('auth.errors.notAuthorized'),
    );

    expect(mockLoggingService.addLog).toHaveBeenCalledWith({
      actionableEntity: CategoriesEnum.users,
      action: ActionsEnum.create,
      slug: 'slug-123',
      ip: '192.168.1.1',
      userId: 'user-123',
      authorized: false,
      body: { name: 'New User' },
      params: {},
      actionableId: '',
    });
  });

  it('should default slug and ip if they are missing in request/user objects', () => {
    mockReflector.get
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(CategoriesEnum.users) // entityType
      .mockReturnValueOnce(ActionsEnum.create); // action

    const mockUser = {
      id: 'user-123',
      role: null, // no role/permissions
    };

    const mockRequest = {
      [REQUEST_USER_KEY]: mockUser,
      body: {},
      params: {},
    };

    const context = createMockContext(mockRequest);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);

    expect(mockLoggingService.addLog).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'no-slug',
        ip: 'no-ip',
        authorized: false,
      }),
    );
  });
});
