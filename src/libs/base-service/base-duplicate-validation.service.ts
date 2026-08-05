import { UnprocessableEntityException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import {
  DuplicateFieldMapping,
  FieldPathOrExtractor,
} from './interfaces/duplicate-validation.interface';

export abstract class BaseDuplicateValidationService {
  constructor(protected readonly i18n: I18nService) {}

  protected getFieldValue<T>(
    obj: T,
    extractor: FieldPathOrExtractor<T>,
  ): unknown {
    if (!obj) {
      return undefined;
    }
    if (typeof extractor === 'function') {
      return extractor(obj);
    }
    if (typeof extractor === 'string') {
      if (extractor.includes('.')) {
        return extractor.split('.').reduce((acc: unknown, part) => {
          if (acc && typeof acc === 'object') {
            return (acc as Record<string, unknown>)[part];
          }
          return undefined;
        }, obj);
      }
      if (obj && typeof obj === 'object') {
        return (obj as Record<string, unknown>)[extractor];
      }
    }
    if (obj && typeof obj === 'object') {
      return (obj as Record<string, unknown>)[extractor as string | number];
    }
    return undefined;
  }

  protected getDuplicateFields<TEntity, TDto>(
    existing: TEntity,
    dto: TDto,
    configs: DuplicateFieldMapping<TEntity, TDto>[],
    defaultMessageKey: string,
  ): Record<string, string> {
    const duplicateFields: Record<string, string> = {};

    for (const config of configs) {
      const existingVal = this.getFieldValue(existing, config.entityField);
      const dtoVal = this.getFieldValue(dto, config.dtoField);

      if (
        existingVal !== undefined &&
        existingVal !== null &&
        existingVal === dtoVal
      ) {
        const errorKey = config.customErrorMessageKey || defaultMessageKey;
        const errorField =
          config.errorField ||
          (typeof config.dtoField === 'string' ? config.dtoField : 'generic');
        duplicateFields[errorField] = this.i18n.t(errorKey);
      }
    }

    return duplicateFields;
  }

  protected validateDuplicates<TEntity, TDto>(
    existing: TEntity | null | undefined,
    dto: TDto,
    configs: DuplicateFieldMapping<TEntity, TDto>[],
    messageKey: string,
  ): void {
    if (!existing) {
      return;
    }

    const duplicateFields = this.getDuplicateFields(
      existing,
      dto,
      configs,
      messageKey,
    );

    if (Object.keys(duplicateFields).length > 0) {
      throw new UnprocessableEntityException({
        message: [this.i18n.t(messageKey)],
        fields: duplicateFields,
      });
    }
  }
}
