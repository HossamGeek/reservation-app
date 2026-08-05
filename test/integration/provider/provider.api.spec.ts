import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { ProviderEntity } from 'src/modules/provider/entities/provider.entity';
import { ProviderService } from 'src/modules/provider/provider.service';
import { ProviderController } from 'src/modules/provider/provider.controller';
import { DocumentService } from 'src/modules/document/document.service';
import { UserService } from 'src/modules/user/user.service';
import { BranchService } from 'src/modules/branch/branch.service';
import { CityService } from 'src/modules/city/city.service';
import { EntityManager } from 'typeorm';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { AuthService } from 'src/modules/auth/auth.service';
import { LoggingService } from 'src/modules/auth/logging.service';
import { ProviderStatusEnum } from 'src/libs/enums/provider-status.enum';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';
import {
  CategoriesEnum,
  systemPermission,
} from 'src/libs/enums/permission.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { UserStatusEnum } from 'src/libs/enums/user-status.enum';

describe('Provider API (integration)', () => {
  let app: INestApplication;

  const mockRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'BASE_URL') {
        return 'http://localhost:5055';
      }

      throw new Error(`Missing config key: ${key}`);
    }),
  };

  const mockJwtService = {
    verifyAsync: jest.fn((token: string) => {
      const tokenPayloads: Record<string, unknown> = {
        'with-permission': {
          id: '1',
          type: UserTypeEnum.ADMIN,
          roleId: '1',
          slug: 'with-permission',
        },
        'without-permission': {
          id: '2',
          type: UserTypeEnum.ADMIN,
          roleId: '2',
          slug: 'without-permission',
        },
      };

      const payload = tokenPayloads[token];

      if (payload) {
        return payload;
      }

      throw new Error('invalid token');
    }),
  };

  const mockAuthService = {
    validateUser: jest.fn(({ slug }: { slug: string }) => {
      const usersBySlug: Record<string, unknown> = {
        'with-permission': {
          id: '1',
          email: 'admin@ERP.com',
          phoneNumber: '+966500000000',
          type: UserTypeEnum.ADMIN,
          status: UserStatusEnum.ACTIVE,
          slug: 'with-permission',
          role: {
            permissions: {
              ...systemPermission,
              [CategoriesEnum.providers]: {
                ...systemPermission[CategoriesEnum.providers],
                detailedView: true,
                update: true,
                review: true,
              },
            },
          },
        },
        'without-permission': {
          id: '2',
          email: 'admin@ERP.com',
          phoneNumber: '+966500000000',
          type: UserTypeEnum.ADMIN,
          status: UserStatusEnum.ACTIVE,
          slug: 'without-permission',
          role: {
            permissions: {
              ...systemPermission,
              [CategoriesEnum.providers]: {
                ...systemPermission[CategoriesEnum.providers],
                detailedView: false,
              },
            },
          },
        },
      };

      return usersBySlug[slug];
    }),
    validateTokenSlug: jest.fn(),
  };

  const mockLoggingService = {
    addLog: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderController],
      providers: [
        ProviderService,
        {
          provide: getRepositoryToken(ProviderEntity),
          useValue: mockRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
        {
          provide: DocumentService,
          useValue: {},
        },
        {
          provide: EntityManager,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: BranchService,
          useValue: {},
        },
        {
          provide: CityService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
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
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');

    const reflector = module.get(Reflector);

    app.useGlobalGuards(
      new AuthGuard(
        module.get(JwtService),
        reflector,
        module.get(AuthService),
        module.get(I18nService),
      ),
      new PermissionGuard(
        reflector,
        module.get(LoggingService),
        module.get(I18nService),
      ),
    );

    await app.init();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 403 when user does not have permission', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/providers/join-request/1')
      .set('Authorization', 'Bearer without-permission');

    expect(response.status).toBe(403);
  });

  it('returns 404 when provider pending request does not exist', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get('/api/providers/join-request/non-existing-id')
      .set('Authorization', 'Bearer with-permission');

    expect(response.status).toBe(404);
  });

  it('returns status only when provider status is not Under Review', async () => {
    mockRepository.findOne.mockResolvedValue({
      id: '1',
      status: ProviderStatusEnum.Approved,
      admins: [],
      branches: [],
    });

    const response = await request(app.getHttpServer())
      .get('/api/providers/join-request/1')
      .set('Authorization', 'Bearer with-permission');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'providers.get.success',
      data: {
        status: ProviderStatusEnum.Approved,
        whiteLabelUrl: 'https://localhost:3000',
      },
      status: 200,
    });
  });

  it('returns full details when provider status is Under Review', async () => {
    mockRepository.findOne.mockResolvedValue({
      id: '1',
      nameAr: 'مقدم خدمة',
      nameEn: 'Service Provider',
      commercialRegistrationNumber: '127387987654',
      recruitmentLicenseNumber: '4679873985',
      status: ProviderStatusEnum.UnderReview,
      rejectionReason: null,
      admins: [
        {
          isOwner: true,
          user: {
            firstName: 'Hossam',
            lastName: 'Hossam',
            email: 'owner@ERP.com',
            phoneNumber: '+996059456126',
          },
        },
      ],
      branches: [
        {
          isMainBranch: true,
          addressAr: 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
          addressEn: 'King Fahd Road, Riyadh, Saudi Arabia',
          cityId: '1',
          city: {
            id: '1',
            nameAr: 'الرياض',
            nameEn: 'Riyadh',
          },
        },
      ],
      logo: {
        id: '10',
        fileName: 'logo',
        fileType: 'PNG',
        status: DocumentStatusEnum.Pending,
        fullUrl: () => 'http://localhost:5505/uploads/logo',
      },
      commercialRegistrationDocument: {
        id: '11',
        fileName: 'commercial-registration',
        fileType: 'PDF',
        status: DocumentStatusEnum.Pending,
        fullUrl: () => 'http://localhost:5505/uploads/commercial-registration',
      },
      recruitmentLicenseDocument: {
        id: '12',
        fileName: 'recruitment-license',
        fileType: 'PDF',
        status: DocumentStatusEnum.Pending,
        fullUrl: () => 'http://localhost:5505/uploads/recruitment-license',
      },
      nationalAddressProofDocument: {
        id: '13',
        fileName: 'national-address-proof',
        fileType: 'PDF',
        status: DocumentStatusEnum.Pending,
        fullUrl: () => 'http://localhost:5505/uploads/national-address-proof',
      },
      ibanCertificateDocument: {
        id: '14',
        fileName: 'iban-certificate',
        fileType: 'PDF',
        status: DocumentStatusEnum.Pending,
        fullUrl: () => 'http://localhost:5505/uploads/iban-certificate',
      },
      vatCertificateDocument: {
        id: '15',
        fileName: 'vat-certificate',
        fileType: 'PDF',
        status: DocumentStatusEnum.Pending,
        fullUrl: () => 'http://localhost:5505/uploads/vat-certificate',
      },
    });

    const response = await request(app.getHttpServer())
      .get('/api/providers/join-request/1')
      .set('Authorization', 'Bearer with-permission');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'providers.get.success',
      data: {
        id: '1',
        name: 'Service Provider',
        branch: {
          city: {
            id: '1',
            name: 'Riyadh',
          },
        },
        commercialRegistrationNumber: '127387987654',
        recruitmentLicenseNumber: '4679873985',
        rejectionReason: null,
        documents: {
          logo: {
            id: '10',
            fullUrl: 'http://localhost:5505/uploads/logo',
            status: DocumentStatusEnum.Pending,
          },
          commercialRegistrationDocument: {
            id: '11',
            fullUrl: 'http://localhost:5505/uploads/commercial-registration',
            status: DocumentStatusEnum.Pending,
          },
          recruitmentLicenseDocument: {
            id: '12',
            fullUrl: 'http://localhost:5505/uploads/recruitment-license',
            status: DocumentStatusEnum.Pending,
          },
          nationalAddressProofDocument: {
            id: '13',
            fullUrl: 'http://localhost:5505/uploads/national-address-proof',
            status: DocumentStatusEnum.Pending,
          },
          ibanCertificateDocument: {
            id: '14',
            fullUrl: 'http://localhost:5505/uploads/iban-certificate',
            status: DocumentStatusEnum.Pending,
          },
          vatCertificateDocument: {
            id: '15',
            fullUrl: 'http://localhost:5505/uploads/vat-certificate',
            status: DocumentStatusEnum.Pending,
          },
        },
        owner: {
          firstName: 'Hossam',
          lastName: 'Hossam',
          email: 'owner@ERP.com',
          phoneNumber: '+996059456126',
        },
        status: ProviderStatusEnum.UnderReview,
      },
      status: 200,
    });
  });
});
