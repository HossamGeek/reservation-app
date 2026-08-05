import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  INestApplication,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import request from 'supertest';
import {
  ACTION_KEY,
  ENTITY_TYPE_KEY,
} from 'src/libs/decorators/entity-action.decorator';
import { LanguagesController } from 'src/modules/languages/languages.controller';
import { LanguagesService } from 'src/modules/languages/languages.service';

@Injectable()
class TestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const contextRequest = context.switchToHttp().getRequest();

    if (!contextRequest.headers.authorization) {
      throw new UnauthorizedException();
    }

    return true;
  }
}

@Injectable()
class TestPermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const contextRequest = context.switchToHttp().getRequest();
    const entity = this.reflector.get<string>(ENTITY_TYPE_KEY, handler);
    const action = this.reflector.get<string>(ACTION_KEY, handler);

    if (!entity || !action) {
      return true;
    }

    const permissionsHeader = contextRequest.headers['x-permissions'];
    const permissions =
      typeof permissionsHeader === 'string' ? permissionsHeader.split(',') : [];

    if (!permissions.includes(`${entity}.${action}`)) {
      throw new ForbiddenException();
    }

    return true;
  }
}

describe('Languages API', () => {
  let app: INestApplication;

  const mockLanguagesService = {
    findAll: jest.fn(),
    create: jest.fn(),
    updateBulkStatus: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [LanguagesController],
      providers: [
        Reflector,
        {
          provide: LanguagesService,
          useValue: mockLanguagesService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
        TestAuthGuard,
        TestPermissionGuard,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalGuards(
      moduleRef.get(TestAuthGuard),
      moduleRef.get(TestPermissionGuard),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const authHeaders = (permissions: string[] = []) => ({
    Authorization: 'Bearer token',
    'x-permissions': permissions.join(','),
  });

  describe('GET /api/languages', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).get('/api/languages');

      expect(response.status).toBe(401);
    });

    it('should return paginated languages', async () => {
      mockLanguagesService.findAll.mockResolvedValue({
        data: [{ id: '1', nameAr: 'العربية', nameEn: 'Arabic', isActive: true }],
        meta: { itemsPerPage: 10 },
        links: {},
      });

      const response = await request(app.getHttpServer())
        .get('/api/languages?page=1&limit=10')
        .set(authHeaders(['languages.listView']));

      expect(response.status).toBe(200);
      expect(mockLanguagesService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 10 }),
      );
      expect(response.body.message).toBe('languages.getAll.success');
    });

    it('should support search by nameAr', async () => {
      mockLanguagesService.findAll.mockResolvedValue({
        data: [],
        meta: {},
        links: {},
      });

      await request(app.getHttpServer())
        .get('/api/languages?search=العربية')
        .set(authHeaders(['languages.listView']));

      expect(mockLanguagesService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'العربية' }),
      );
    });

    it('should support search by nameEn', async () => {
      mockLanguagesService.findAll.mockResolvedValue({
        data: [],
        meta: {},
        links: {},
      });

      await request(app.getHttpServer())
        .get('/api/languages?search=Arabic')
        .set(authHeaders(['languages.listView']));

      expect(mockLanguagesService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Arabic' }),
      );
    });

    it('should support filter by isActive', async () => {
      mockLanguagesService.findAll.mockResolvedValue({
        data: [],
        meta: {},
        links: {},
      });

      await request(app.getHttpServer())
        .get('/api/languages?filter.isActive=$eq:true')
        .set(authHeaders(['languages.listView']));

      expect(mockLanguagesService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ filter: { isActive: '$eq:true' } }),
      );
    });
  });

  describe('POST /api/languages', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/languages')
        .send({ name: { ar: 'العربية', en: 'Arabic' } });

      expect(response.status).toBe(401);
    });

    it('should create a language', async () => {
      const payload = { name: { ar: 'العربية', en: 'Arabic' } };

      mockLanguagesService.create.mockResolvedValue({
        id: '1',
        ...payload,
        isActive: false,
      });

      const response = await request(app.getHttpServer())
        .post('/api/languages')
        .set(authHeaders(['languages.create']))
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('languages.create.success');
      expect(mockLanguagesService.create).toHaveBeenCalledWith(payload);
    });

    it('should reject duplicate nameAr', async () => {
      mockLanguagesService.create.mockRejectedValue(
        new UnprocessableEntityException({
          message: 'languages.alreadyExists',
          fields: {
            'name.ar': 'languages.alreadyExists',
          },
        }),
      );

      const response = await request(app.getHttpServer())
        .post('/api/languages')
        .set(authHeaders(['languages.create']))
        .send({ name: { ar: 'العربية', en: 'Arabic' } });

      expect(response.status).toBe(422);
    });

    it('should reject duplicate nameEn', async () => {
      mockLanguagesService.create.mockRejectedValue(
        new UnprocessableEntityException({
          message: 'languages.alreadyExists',
          fields: {
            'name.en': 'languages.alreadyExists',
          },
        }),
      );

      const response = await request(app.getHttpServer())
        .post('/api/languages')
        .set(authHeaders(['languages.create']))
        .send({ name: { ar: 'العربية', en: 'Arabic' } });

      expect(response.status).toBe(422);
    });

    it('should reject missing nameAr', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/languages')
        .set(authHeaders(['languages.create']))
        .send({ name: { en: 'Arabic' } });

      expect(response.status).toBe(400);
    });

    it('should reject missing nameEn', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/languages')
        .set(authHeaders(['languages.create']))
        .send({ name: { ar: 'العربية' } });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/languages/:id/status', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/languages/1/status')
        .send({ isActive: true });

      expect(response.status).toBe(401);
    });

    it('should activate a language', async () => {
      mockLanguagesService.updateStatus.mockResolvedValue({
        id: '1',
        isActive: true,
      });

      const response = await request(app.getHttpServer())
        .patch('/api/languages/1/status')
        .set(authHeaders(['languages.update']))
        .send({ isActive: true });

      expect(response.status).toBe(200);
      expect(mockLanguagesService.updateStatus).toHaveBeenCalledWith('1', {
        isActive: true,
      });
    });

    it('should deactivate a language', async () => {
      mockLanguagesService.updateStatus.mockResolvedValue({
        id: '1',
        isActive: false,
      });

      const response = await request(app.getHttpServer())
        .patch('/api/languages/1/status')
        .set(authHeaders(['languages.update']))
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(mockLanguagesService.updateStatus).toHaveBeenCalledWith('1', {
        isActive: false,
      });
    });

    it('should return 404 for invalid id', async () => {
      mockLanguagesService.updateStatus.mockRejectedValue(
        new NotFoundException('languages.notFound'),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/languages/999/status')
        .set(authHeaders(['languages.update']))
        .send({ isActive: true });

      expect(response.status).toBe(404);
    });

    it('should reject non-boolean status', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/languages/1/status')
        .set(authHeaders(['languages.update']))
        .send({ isActive: 'true' });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/languages/bulk-activation-status', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/languages/bulk-activation-status')
        .send({ isActive: true });

      expect(response.status).toBe(401);
    });

    it('requires update permission', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/languages/bulk-activation-status')
        .set(authHeaders([]))
        .send({ isActive: true });

      expect(response.status).toBe(403);
    });

    it('should activate all languages', async () => {
      mockLanguagesService.updateBulkStatus.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .patch('/api/languages/bulk-activation-status')
        .set(authHeaders(['languages.update']))
        .send({ isActive: true });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('languages.update.bulkActivate.success');
      expect(response.body.data).toBeUndefined();
      expect(mockLanguagesService.updateBulkStatus).toHaveBeenCalledWith({
        isActive: true,
      });
    });

    it('should deactivate all languages', async () => {
      mockLanguagesService.updateBulkStatus.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .patch('/api/languages/bulk-activation-status')
        .set(authHeaders(['languages.update']))
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('languages.update.bulkDeactivate.success');
      expect(response.body.data).toBeUndefined();
      expect(mockLanguagesService.updateBulkStatus).toHaveBeenCalledWith({
        isActive: false,
      });
    });

    it('should return 404 when there are no languages', async () => {
      mockLanguagesService.updateBulkStatus.mockRejectedValue(
        new NotFoundException('languages.notFound'),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/languages/bulk-activation-status')
        .set(authHeaders(['languages.update']))
        .send({ isActive: true });

      expect(response.status).toBe(404);
    });

    it('should reject non-boolean status', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/languages/bulk-activation-status')
        .set(authHeaders(['languages.update']))
        .send({ isActive: 'true' });

      expect(response.status).toBe(400);
    });
  });
});
