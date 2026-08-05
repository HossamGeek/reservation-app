import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';

export function IsValidPermissions(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidPermissions',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          // Ensure value is an object
          if (typeof value !== 'object' || value === null) {
            throw new BadRequestException(
              `${args.property} must be an object.`,
            );
          }

          const categoriesValues = Object.values(CategoriesEnum);
          const actionValues = Object.values(ActionsEnum);

          // Check if each category is valid
          for (const category in value) {
            if (!categoriesValues.includes(category as CategoriesEnum)) {
              throw new BadRequestException(
                `${category} is not a valid category.`,
              );
            }

            // Check if the value associated with the category is an array
            if (!Array.isArray(value[category])) {
              throw new BadRequestException(
                `Value associated with category ${category} must be an array of actions.`,
              );
            }

            // Check if each action is valid
            for (const action of value[category]) {
              if (!actionValues.includes(action as ActionsEnum)) {
                throw new BadRequestException(
                  `${action} is not a valid action for ${category}.`,
                );
              }
            }
          }

          return true;
        },
      },
    });
  };
}
