import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

const MAX_SIGNED_BIGINT = BigInt('9223372036854775807');
export function IsBigIntId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'IsBigIntId',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
            return false;
          }

          try {
            return BigInt(value) <= MAX_SIGNED_BIGINT;
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be a valid positive BIGINT identifier.`;
        },
      },
    });
  };
}
