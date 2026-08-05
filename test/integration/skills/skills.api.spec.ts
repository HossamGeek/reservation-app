import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  INestApplication,
  NotFoundException,
  UnauthorizedException,
  ValidationPipe,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { I18nService } from 'nestjs-i18n';
import { SkillsController } from 'src/modules/skills/skills.controller';
import { SkillsService } from 'src/modules/skills/skills.service';
import {
  ACTION_KEY,
  ENTITY_TYPE_KEY,
} from 'src/libs/decorators/entity-action.decorator';

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

describe('Skills API', () => {
  let app: INestApplication;

  const mockSkillsService = {
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
      controllers: [SkillsController],
      providers: [
        Reflector,
        {
          provide: SkillsService,
          useValue: mockSkillsService,
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

  describe('GET /api/skills', () => {
    it('returns paginated skills', async () => {
      mockSkillsService.findAll.mockResolvedValue({
        data: [{ id: '1', name: 'Cooking' }],
        meta: { itemsPerPage: 10 },
        links: {},
      });

      const response = await request(app.getHttpServer())
        .get('/api/skills?page=1&limit=10')
        .set(authHeaders(['skills.listView']));

      expect(response.status).toBe(200);
      expect(mockSkillsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 10 }),
      );
      expect(response.body.message).toBe('skills.getAll.success');
    });

    it('supports search by English name', async () => {
      mockSkillsService.findAll.mockResolvedValue({
        data: [],
        meta: {},
        links: {},
      });

      await request(app.getHttpServer())
        .get('/api/skills?search=Cooking')
        .set(authHeaders(['skills.listView']));

      expect(mockSkillsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Cooking' }),
      );
    });

    it('supports search by Arabic name', async () => {
      mockSkillsService.findAll.mockResolvedValue({
        data: [],
        meta: {},
        links: {},
      });

      await request(app.getHttpServer())
        .get('/api/skills?search=الطبخ')
        .set(authHeaders(['skills.listView']));

      expect(mockSkillsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'الطبخ' }),
      );
    });

    it('filters by active status', async () => {
      mockSkillsService.findAll.mockResolvedValue({
        data: [],
        meta: {},
        links: {},
      });

      await request(app.getHttpServer())
        .get('/api/skills?filter.isActive=$eq:true')
        .set(authHeaders(['skills.listView']));

      expect(mockSkillsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ filter: { isActive: '$eq:true' } }),
      );
    });

    it('supports sorting by nameEn', async () => {
      mockSkillsService.findAll.mockResolvedValue({
        data: [],
        meta: {},
        links: {},
      });

      await request(app.getHttpServer())
        .get('/api/skills?sortBy=nameEn:ASC')
        .set(authHeaders(['skills.listView']));

      expect(mockSkillsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: [['nameEn', 'ASC']] }),
      );
    });

    it('supports sorting by createdAt', async () => {
      mockSkillsService.findAll.mockResolvedValue({
        data: [],
        meta: {},
        links: {},
      });

      await request(app.getHttpServer())
        .get('/api/skills?sortBy=createdAt:DESC')
        .set(authHeaders(['skills.listView']));

      expect(mockSkillsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: [['createdAt', 'DESC']] }),
      );
    });

    it('requires authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/skills');

      expect(response.status).toBe(401);
    });

    it('requires the correct permission', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/skills')
        .set(authHeaders([]))

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/skills', () => {
    it('creates a new skill successfully', async () => {
      mockSkillsService.create.mockResolvedValue(undefined);

      const payload = { name: { ar: 'الطبخ', en: 'Cooking' } };

      const response = await request(app.getHttpServer())
        .post('/api/skills')
        .set(authHeaders(['skills.create']))
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('skills.create.success');
      expect(mockSkillsService.create).toHaveBeenCalledWith(payload);
    });

    it('rejects missing Arabic name', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/skills')
        .set(authHeaders(['skills.create']))
        .send({ name: { en: 'Cooking' } });

      expect(response.status).toBe(400);
    });

    it('rejects missing English name', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/skills')
        .set(authHeaders(['skills.create']))
        .send({ name: { ar: 'الطبخ' } });

      expect(response.status).toBe(400);
    });

    it('rejects duplicate Arabic name', async () => {
      mockSkillsService.create.mockRejectedValue(
        new UnprocessableEntityException({
          message: 'skills.alreadyExists',
          fields: {
            'name.ar': 'skills.alreadyExists',
          },
        }),
      );

      const response = await request(app.getHttpServer())
        .post('/api/skills')
        .set(authHeaders(['skills.create']))
        .send({ name: { ar: 'الطبخ', en: 'Cooking' } });

      expect(response.status).toBe(422);
    });

    it('rejects duplicate English name', async () => {
      mockSkillsService.create.mockRejectedValue(
        new UnprocessableEntityException({
          message: 'skills.alreadyExists',
          fields: {
            'name.en': 'skills.alreadyExists',
          },
        }),
      );

      const response = await request(app.getHttpServer())
        .post('/api/skills')
        .set(authHeaders(['skills.create']))
        .send({ name: { ar: 'الطبخ', en: 'Cooking' } });

      expect(response.status).toBe(422);
    });

    it('requires authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/skills')
        .send({ name: { ar: 'الطبخ', en: 'Cooking' } });

      expect(response.status).toBe(401);
    });

    it('requires the correct permission', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/skills')
        .set(authHeaders([]))
        .send({ name: { ar: 'الطبخ', en: 'Cooking' } });

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/skills/:id/status', () => {
    it('activates a skill', async () => {
      mockSkillsService.updateStatus.mockResolvedValue({
        id: '1',
        isActive: true,
      });

      const response = await request(app.getHttpServer())
        .patch('/api/skills/1/status')
        .set(authHeaders(['skills.update']))
        .send({ isActive: true });

      expect(response.status).toBe(200);
      expect(mockSkillsService.updateStatus).toHaveBeenCalledWith('1', {
        isActive: true,
      });
    });

    it('deactivates a skill', async () => {
      mockSkillsService.updateStatus.mockResolvedValue({
        id: '1',
        isActive: false,
      });

      const response = await request(app.getHttpServer())
        .patch('/api/skills/1/status')
        .set(authHeaders(['skills.update']))
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(mockSkillsService.updateStatus).toHaveBeenCalledWith('1', {
        isActive: false,
      });
    });

    it('rejects invalid boolean value', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/skills/1/status')
        .set(authHeaders(['skills.update']))
        .send({ isActive: 'true' });

      expect(response.status).toBe(400);
    });

    it('returns not found if skill does not exist', async () => {
      mockSkillsService.updateStatus.mockRejectedValue(
        new NotFoundException('skills.notFound'),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/skills/999/status')
        .set(authHeaders(['skills.update']))
        .send({ isActive: true });

      expect(response.status).toBe(404);
    });

    it('requires authentication', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/skills/1/status')
        .send({ isActive: true });

      expect(response.status).toBe(401);
    });

    it('requires the correct permission', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/skills/1/status')
        .set(authHeaders([]))
        .send({ isActive: true });

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/skills/bulk-activation-status', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/skills/bulk-activation-status')
        .send({ isActive: true });

      expect(response.status).toBe(401);
    });

    it('requires update permission', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/skills/bulk-activation-status')
        .set(authHeaders([]))
        .send({ isActive: true });

      expect(response.status).toBe(403);
    });

    it('should activate all skills', async () => {
      mockSkillsService.updateBulkStatus.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .patch('/api/skills/bulk-activation-status')
        .set(authHeaders(['skills.update']))
        .send({ isActive: true });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('skills.update.bulkActivate.success');
      expect(response.body.data).toBeUndefined();
      expect(mockSkillsService.updateBulkStatus).toHaveBeenCalledWith({
        isActive: true,
      });
    });

    it('should deactivate all skills', async () => {
      mockSkillsService.updateBulkStatus.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .patch('/api/skills/bulk-activation-status')
        .set(authHeaders(['skills.update']))
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('skills.update.bulkDeactivate.success');
      expect(response.body.data).toBeUndefined();
      expect(mockSkillsService.updateBulkStatus).toHaveBeenCalledWith({
        isActive: false,
      });
    });

    it('should return 404 when there are no skills', async () => {
      mockSkillsService.updateBulkStatus.mockRejectedValue(
        new NotFoundException('skills.notFound'),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/skills/bulk-activation-status')
        .set(authHeaders(['skills.update']))
        .send({ isActive: true });

      expect(response.status).toBe(404);
    });

    it('should reject non-boolean status', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/skills/bulk-activation-status')
        .set(authHeaders(['skills.update']))
        .send({ isActive: 'true' });

      expect(response.status).toBe(400);
    });
  });
});
