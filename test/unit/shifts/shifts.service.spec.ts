import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as nestjsPaginate from 'nestjs-paginate';
import { I18nService } from 'nestjs-i18n';
import { ShiftService } from 'src/modules/shifts/shift.service';
import { ShiftEntity } from 'src/modules/shifts/entities/shift.entity';
import { ProviderService } from 'src/modules/provider/provider.service';
import { CreateShiftDto } from 'src/modules/shifts/dto/request/create-shift.dto';
import { UpdateShiftDto } from 'src/modules/shifts/dto/request/update-shift.dto';
import { ProviderAdminEntity } from 'src/modules/user/entities/provider-admin.entity';
import { UserStatusEnum } from 'src/libs/enums/user-status.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';

jest.mock('nestjs-paginate', () => {
  const actual = jest.requireActual('nestjs-paginate');
  return {
    ...actual,
    paginate: jest.fn(),
  };
});

describe('ShiftService', () => {
  let service: ShiftService;

  const queryBuilder = {
    where: jest.fn().mockReturnThis(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  const mockProviderService = {
    findOneBy: jest.fn(),
  };

  const validDto: CreateShiftDto = {
    providerId: 'provider-1',
    name: 'Morning',
    fromHour: 9,
    toHour: 17,
  };

  const providerUser: ILoginUser = {
    id: 'user-1',
    email: 'provider@example.com',
    phoneNumber: '+966500000000',
    type: UserTypeEnum.PROVIDER,
    status: UserStatusEnum.ACTIVE,
    providerAdmin: {
      providerId: 'provider-1',
    } as ProviderAdminEntity,
    role: null,
  };

  const paginateMock = nestjsPaginate.paginate as jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftService,
        {
          provide: getRepositoryToken(ShiftEntity),
          useValue: mockRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
        {
          provide: ProviderService,
          useValue: mockProviderService,
        },
      ],
    }).compile();

    service = module.get(ShiftService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a shift when data is valid', async () => {
      const createdEntity = { id: 'shift-1', ...validDto } as ShiftEntity;

      mockProviderService.findOneBy.mockResolvedValue({
        id: validDto.providerId,
      });
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(createdEntity);
      mockRepository.save.mockResolvedValue(createdEntity);

      await service.create(validDto);

      expect(mockProviderService.findOneBy).toHaveBeenCalledWith({
        where: { id: validDto.providerId },
      });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { providerId: validDto.providerId, name: validDto.name },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(validDto);
      expect(mockRepository.save).toHaveBeenCalledWith(createdEntity);
    });

    it('should throw NotFoundException when provider does not exist', async () => {
      mockProviderService.findOneBy.mockResolvedValue(null);

      await expect(service.create(validDto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when fromHour is greater than or equal to toHour', async () => {
      const dto: CreateShiftDto = {
        ...validDto,
        fromHour: 18,
        toHour: 18,
      };

      await expect(service.create(dto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(mockProviderService.findOneBy).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when shift name already exists for provider', async () => {
      mockProviderService.findOneBy.mockResolvedValue({
        id: validDto.providerId,
      });
      mockRepository.findOne.mockResolvedValue({
        id: 'existing-shift',
        providerId: validDto.providerId,
        name: validDto.name,
      });

      await expect(service.create(validDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('should scope query to authenticated provider and map response', async () => {
      const createdAt = new Date('2026-07-14T08:30:00.000Z');

      paginateMock.mockResolvedValue({
        data: [
          {
            id: 'shift-1',
            name: 'Morning Shift',
            fromHour: 8,
            toHour: 12,
            isActive: true,
            createdAt,
            providerId: 'provider-1',
          },
        ],
        meta: { totalItems: 1 },
        links: {},
      });

      const result = await service.findAll(
        { path: '/shifts' },
        providerUser,
      );

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'shift.providerId = :providerId',
        { providerId: 'provider-1' },
      );
      expect(paginateMock).toHaveBeenCalledWith(
        { path: '/shifts' },
        queryBuilder,
        expect.objectContaining({
          searchableColumns: ['name'],
          filterableColumns: expect.objectContaining({
            status: true,
          }),
          defaultSortBy: [
            ['createdAt', 'DESC'],
            ['id', 'DESC'],
          ],
        }),
      );
      expect(result.data).toEqual([
        {
          id: 'shift-1',
          name: 'Morning Shift',
          fromHour: 8,
          toHour: 12,
          isActive: true,
          createdAt,
        },
      ]);
      expect(result.data[0]).not.toHaveProperty('providerId');
    });

    it('should return empty paginated result when provider has no shifts', async () => {
      paginateMock.mockResolvedValue({
        data: [],
        meta: { totalItems: 0 },
        links: {},
      });

      const result = await service.findAll(
        { path: '/shifts' },
        providerUser,
      );

      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({ totalItems: 0 });
    });

    it('should support filtering active shifts by isActive status', async () => {
      const query = {
        path: '/shifts',
        filter: { isActive: '$eq:true' },
      };

      paginateMock.mockResolvedValue({ data: [], meta: {}, links: {} });

      await service.findAll(query, providerUser);

      expect(paginateMock).toHaveBeenCalledWith(
        query,
        queryBuilder,
        expect.objectContaining({
          filterableColumns: expect.objectContaining({
            status: true,
          }),
        }),
      );
    });

    it('should support filtering inactive shifts by isActive status', async () => {
      const query = {
        path: '/shifts',
        filter: { isActive: '$eq:false' },
      };

      paginateMock.mockResolvedValue({ data: [], meta: {}, links: {} });

      await service.findAll(query, providerUser);

      expect(paginateMock).toHaveBeenCalledWith(
        query,
        queryBuilder,
        expect.objectContaining({
          filterableColumns: expect.objectContaining({
            status: true,
          }),
        }),
      );
    });

    it('should throw forbidden when authenticated user is not provider', async () => {
      await expect(
        service.findAll(
          { path: '/shifts' },
          {
            ...providerUser,
            type: UserTypeEnum.ADMIN,
          },
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(mockRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should throw forbidden when provider association is missing', async () => {
      await expect(
        service.findAll(
          { path: '/shifts' },
          {
            ...providerUser,
            providerAdmin: null,
          },
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(mockRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const existingShift = {
      id: 'shift-1',
      providerId: 'provider-1',
      name: 'Morning',
      fromHour: 9,
      toHour: 17,
      isActive: true,
    } as ShiftEntity;

    it('should update shift successfully', async () => {
      const dto: UpdateShiftDto = {
        name: 'Evening',
        fromHour: 16,
        toHour: 22,
      };

      mockRepository.findOne.mockResolvedValueOnce(existingShift); // For get shift
      mockProviderService.findOneBy.mockResolvedValueOnce({ id: 'provider-1' });
      mockRepository.findOne.mockResolvedValueOnce(null); // For name uniqueness
      mockRepository.save.mockResolvedValueOnce({ ...existingShift, ...dto });

      await service.update('shift-1', dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'shift-1' } });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when shift does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('shift-99', {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnprocessableEntityException if name is duplicate', async () => {
      const dto: UpdateShiftDto = { name: 'DuplicateName' };

      mockRepository.findOne.mockResolvedValueOnce(existingShift);
      mockProviderService.findOneBy.mockResolvedValueOnce({ id: 'provider-1' });
      mockRepository.findOne.mockResolvedValueOnce({ id: 'shift-2', name: 'DuplicateName' }); // existing duplicate shift

      await expect(
        service.update('shift-1', dto),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if hours are out of boundaries', async () => {
      const dto: UpdateShiftDto = { fromHour: 25 };

      mockRepository.findOne.mockResolvedValueOnce(existingShift);
      mockProviderService.findOneBy.mockResolvedValueOnce({ id: 'provider-1' });

      await expect(
        service.update('shift-1', dto),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if fromHour is greater than toHour', async () => {
      const dto: UpdateShiftDto = { fromHour: 18, toHour: 10 };

      mockRepository.findOne.mockResolvedValueOnce(existingShift);
      mockProviderService.findOneBy.mockResolvedValueOnce({ id: 'provider-1' });

      await expect(
        service.update('shift-1', dto),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('updateStatus', () => {
    const existingShift = {
      id: 'shift-1',
      providerId: 'provider-1',
      name: 'Morning',
      fromHour: 9,
      toHour: 17,
      isActive: true,
    } as ShiftEntity;

    it('should update status successfully', async () => {
      mockRepository.findOne.mockResolvedValueOnce(existingShift);
      mockProviderService.findOneBy.mockResolvedValueOnce({ id: 'provider-1' });
      mockRepository.save.mockResolvedValueOnce({ ...existingShift, isActive: false });

      await service.updateStatus('shift-1', false);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'shift-1' } });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when shift does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus('shift-99', false),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
