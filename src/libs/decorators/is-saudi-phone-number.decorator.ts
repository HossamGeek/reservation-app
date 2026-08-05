import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { STRICT_E164_SAUDI_REGEX } from '../constants/global-constants';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

// is-saudi-phone-number.decorator.ts — validation ONLY, no side effects
export function IsSaudiPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSaudiPhoneNumber',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }
          if (!STRICT_E164_SAUDI_REGEX.test(value)) {
            return false;
          }

          const phoneNumber = parsePhoneNumberFromString(value, 'SA');
          if (!phoneNumber) {
            return false;
          }

          // The 'MOBILE' and 'SA' are string literal types provided by the libphonenumber-js/max, 
          // so it is safe to use them here without any type assertion as typos would be caught at compile time.
          const numberType = phoneNumber.getType();
          return (
            phoneNumber.isValid() &&
            phoneNumber.country === 'SA' &&
            numberType !== undefined &&
            numberType === 'MOBILE'
          );
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be a valid Saudi Arabia mobile phone number`;
        },
      },
    });
  };
}
