import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { I18nContext } from 'nestjs-i18n';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function IsNotPastDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'IsNotPastDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) {
            return false;
          }

          const [year, month, day] = value.split('-').map(Number);

          // Reject impossible calendar dates (e.g. 2026-02-30) via a UTC round-trip.
          const parsed = new Date(Date.UTC(year, month - 1, day));
          if (
            parsed.getUTCFullYear() !== year ||
            parsed.getUTCMonth() !== month - 1 ||
            parsed.getUTCDate() !== day
          ) {
            return false;
          }

          const now = new Date();
          const utcToday = Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
          );

          return Date.UTC(year, month - 1, day) >= utcToday;
        },
        defaultMessage(args: ValidationArguments): string {
          return (
            I18nContext.current()?.t('common.validation.notPastDate', {
              args: { property: args.property },
            }) ?? `${args.property} must not be before today`
          );
        },
      },
    });
  };
}