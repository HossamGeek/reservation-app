import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';

// start with a letter, contain at least one letter or number and may contain spaces, dash, dot and underscore only
export const nameRegex = /^[a-zA-Z](?=.*[a-zA-Z0-9])[a-zA-Z0-9-_. ]*/;

export function IsName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsName',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          return nameRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must start with letter contain at least one letter and may contain numbers, spaces, dash, dot and underscore only.`;
        },
      },
    });
  };
}
