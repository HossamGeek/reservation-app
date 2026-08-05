import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { BaseDuplicateValidationService } from 'src/libs/base-service/base-duplicate-validation.service';
import { DuplicateFieldMapping, FieldPathOrExtractor, NestedPropertyPaths } from 'src/libs/base-service/interfaces/duplicate-validation.interface';

// Dummy entity and DTO types
interface TestEntity {
  id: string;
  nameAr: string;
  nameEn: string;
  nested: {
    value: string;
  };
}

interface TestDto {
  name: {
    ar: string;
    en: string;
  };
  nestedVal: string;
}

@Injectable()
class TestDuplicateValidationService extends BaseDuplicateValidationService {
  constructor(i18n: I18nService) {
    super(i18n);
  }

  // Expose protected methods for testing
  public testGetFieldValue<T>(obj: T, extractor: FieldPathOrExtractor<T>): unknown {
    return this.getFieldValue(obj, extractor);
  }

  public testGetDuplicateFields<TEntity, TDto>(
    existing: TEntity,
    dto: TDto,
    configs: DuplicateFieldMapping<TEntity, TDto>[],
    defaultMessageKey: string,
  ): Record<string, string> {
    return this.getDuplicateFields(existing, dto, configs, defaultMessageKey);
  }

  public testValidateDuplicates<TEntity, TDto>(
    existing: TEntity | null | undefined,
    dto: TDto,
    configs: DuplicateFieldMapping<TEntity, TDto>[],
    messageKey: string,
  ): void {
    this.validateDuplicates(existing, dto, configs, messageKey);
  }
}

describe('BaseDuplicateValidationService', () => {
  let service: TestDuplicateValidationService;

  const mockI18n = {
    t: jest.fn((key: string) => `translated:${key}`),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestDuplicateValidationService,
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    service = module.get(TestDuplicateValidationService);
    jest.clearAllMocks();
  });

  describe('getFieldValue', () => {
    it('should return undefined if object is null or undefined', () => {
      expect(service.testGetFieldValue(null as unknown as TestEntity, 'nameAr' as unknown as NestedPropertyPaths<TestEntity>)).toBeUndefined();
      expect(service.testGetFieldValue(undefined as unknown as TestEntity, 'nameAr' as unknown as NestedPropertyPaths<TestEntity>)).toBeUndefined();
    });

    it('should extract values using key names', () => {
      const obj = { key: 'val' };
      expect(service.testGetFieldValue(obj, 'key')).toBe('val');
    });

    it('should extract nested values using dot notation', () => {
      const obj = { nested: { inner: 'deep-val' } };
      expect(service.testGetFieldValue(obj, 'nested.inner')).toBe('deep-val');
      expect(service.testGetFieldValue(obj as unknown as TestEntity, 'nested.nonExistent' as unknown as NestedPropertyPaths<TestEntity>)).toBeUndefined();
    });

    it('should extract values using callback function', () => {
      const obj = { a: 10, b: 20 };
      const callback = (o: typeof obj) => o.a + o.b;
      expect(service.testGetFieldValue(obj, callback)).toBe(30);
    });
  });

  describe('getDuplicateFields', () => {
    const existing: TestEntity = {
      id: '1',
      nameAr: 'العربية',
      nameEn: 'Arabic',
      nested: { value: 'nested-existing' },
    };

    const dto: TestDto = {
      name: {
        ar: 'العربية',
        en: 'English', // different
      },
      nestedVal: 'nested-existing',
    };

    it('should identify duplicate fields and translate messages using default key', () => {
      const configs: DuplicateFieldMapping<TestEntity, TestDto>[] = [
        { entityField: 'nameAr', dtoField: 'name.ar' },
        { entityField: 'nameEn', dtoField: 'name.en' },
        {
          entityField: (e) => e.nested.value,
          dtoField: 'nestedVal',
          errorField: 'nested',
        },
      ];

      const result = service.testGetDuplicateFields(
        existing,
        dto,
        configs,
        'default.duplicate',
      );

      expect(result).toEqual({
        'name.ar': 'translated:default.duplicate',
        nested: 'translated:default.duplicate',
      });
      expect(mockI18n.t).toHaveBeenCalledWith('default.duplicate');
    });

    it('should respect customErrorMessageKey in configurations', () => {
      const configs: DuplicateFieldMapping<TestEntity, TestDto>[] = [
        {
          entityField: 'nameAr',
          dtoField: 'name.ar',
          customErrorMessageKey: 'custom.nameAr',
        },
      ];

      const result = service.testGetDuplicateFields(
        existing,
        dto,
        configs,
        'default.duplicate',
      );

      expect(result).toEqual({
        'name.ar': 'translated:custom.nameAr',
      });
      expect(mockI18n.t).toHaveBeenCalledWith('custom.nameAr');
    });
  });

  describe('validateDuplicates', () => {
    const existing: TestEntity = {
      id: '1',
      nameAr: 'العربية',
      nameEn: 'Arabic',
      nested: { value: 'nested-existing' },
    };

    const dto: TestDto = {
      name: {
        ar: 'العربية',
        en: 'English',
      },
      nestedVal: 'nested-existing',
    };

    const configs: DuplicateFieldMapping<TestEntity, TestDto>[] = [
      { entityField: 'nameAr', dtoField: 'name.ar' },
    ];

    it('should return silently if existing is null or undefined', () => {
      expect(() =>
        service.testValidateDuplicates(null, dto, configs, 'msg'),
      ).not.toThrow();
    });

    it('should throw UnprocessableEntityException if duplicates are detected', () => {
      expect(() =>
        service.testValidateDuplicates(existing, dto, configs, 'msg.exists'),
      ).toThrow(
        new UnprocessableEntityException({
          message: ['translated:msg.exists'],
          fields: {
            'name.ar': 'translated:msg.exists',
          },
        }),
      );
    });

    it('should pass silently if no duplicates are detected', () => {
      const nonDuplicateDto: TestDto = {
        name: {
          ar: 'different',
          en: 'different',
        },
        nestedVal: 'different',
      };

      expect(() =>
        service.testValidateDuplicates(existing, nonDuplicateDto, configs, 'msg'),
      ).not.toThrow();
    });
  });
});
