/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoggingService } from 'src/modules/auth/logging.service';
import { Logging } from 'src/modules/auth/entities/logging.entity';
import { CreateLogRecordDto } from 'src/modules/auth/dto/request/create-log-record.dto';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';

describe('LoggingService', () => {
  let service: LoggingService;

  const mockRepository = {
    insert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingService,
        {
          provide: getRepositoryToken(Logging),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<LoggingService>(LoggingService);
    jest.clearAllMocks();
  });

  describe('addLog', () => {
    it('should insert log record and mask password in body if present', async () => {
      const record: CreateLogRecordDto = {
        actionableEntity: CategoriesEnum.users,
        action: ActionsEnum.create,
        slug: 'test-slug',
        ip: '127.0.0.1',
        userId: 'user-1',
        authorized: true,
        body: {
          email: 'test@example.com',
          password: 'secretPassword',
          confirmPassword: 'secretPassword',
        },
        params: {},
        actionableId: '',
      };

      mockRepository.insert.mockResolvedValue({} as any);

      await service.addLog(record);

      // Verify the original record remains unmodified
      expect(record.body.password).toBe('secretPassword');
      expect(record.body.confirmPassword).toBe('secretPassword');

      // Verify repository insert was called with masked passwords
      expect(mockRepository.insert).toHaveBeenCalledWith({
        ...record,
        body: {
          email: 'test@example.com',
          password: '*****',
          confirmPassword: '*****',
        },
      });
    });

    it('should insert log record when body is null or undefined', async () => {
      const record: CreateLogRecordDto = {
        actionableEntity: CategoriesEnum.roles,
        action: ActionsEnum.listView,
        slug: 'test-slug',
        ip: '127.0.0.1',
        userId: 'user-1',
        authorized: true,
        body: null as any,
        params: {},
        actionableId: '',
      };

      mockRepository.insert.mockResolvedValue({} as any);

      await service.addLog(record);

      expect(mockRepository.insert).toHaveBeenCalledWith(record);
    });
  });
});
