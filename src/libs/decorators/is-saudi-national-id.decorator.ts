import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { SAUDI_NATIONAL_ID_REGEX } from '../constants/global-constants';

export function IsSaudiNationalId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSaudiNationalId',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          return (
            typeof value === 'string' && SAUDI_NATIONAL_ID_REGEX.test(value)
          );
        },
        defaultMessage(_args: ValidationArguments) {
          return `${_args.property} must be a valid Saudi National ID`;
        },
      },
    });
  };
}
