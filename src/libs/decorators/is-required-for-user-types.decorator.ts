import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';

export function IsRequiredForUserTypes(
  types: UserTypeEnum[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isRequiredForUserTypes',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [types],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const obj = args.object as Record<string, unknown>;
          const [allowedTypes] = args.constraints as [UserTypeEnum[]];
          const isRequired = allowedTypes.includes(obj.type as UserTypeEnum);

          if (isRequired) {
            if (value === undefined || value === null || value === '') {
              return false;
            }
            return (
              typeof value === 'number' && Number.isInteger(value) && value > 0
            );
          }

          if (value !== undefined && value !== null && value !== '') {
            return (
              typeof value === 'number' && Number.isInteger(value) && value > 0
            );
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const obj = args.object as Record<string, unknown>;
          const [allowedTypes] = args.constraints as [UserTypeEnum[]];
          const isRequired = allowedTypes.includes(obj.type as UserTypeEnum);

          if (
            isRequired &&
            (args.value === undefined ||
              args.value === null ||
              args.value === '')
          ) {
            return `${args.property} is required when user type is ${obj.type}`;
          }
          return `${args.property} must be a positive integer ID`;
        },
      },
    });
  };
}
