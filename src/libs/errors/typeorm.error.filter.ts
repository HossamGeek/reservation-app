/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { isArray, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ErrorFormatter implements PipeTransform<unknown> {
  private getKeyConstraints<T extends Record<string, unknown>>(key: string, val: T, child?: T) {
    const property = child ? child?.property : val?.property;
    const constraints = child ? child?.constraints : val?.constraints;

    if (constraints && constraints[key]) {
      const message = constraints[key];
      if (property) {
        const safeProp = String(property).replace(/_/g, ' ');

        return message.replace(property, safeProp).replace('The value', `The ${safeProp}`);
      }
      return message;
    }

    if (key === 'isNotEmpty' && property) {
      return `The ${property} field is required.`;
    }

    if (property) {
      return `The ${property} field is invalid.`;
    }

    return 'Invalid field';
  }

  async transform(value: unknown, { metatype, type }: ArgumentMetadata) {
    // Skip validation for custom decorators (like @CurrentAdmin, @CurrentVault, etc.)
    // Only validate 'body' and 'query' parameters
    if (type === 'custom') {
      return value;
    }

    // If body is missing, validate an empty object to produce proper errors
    if (value === undefined || value === null) {
      value = {};
    }

    if (!metatype || !this.toValidate(metatype)) { return value; }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    const errorsObject = {};

    let errorMsgs: string[] = [];

    if (errors.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errors.forEach((val: any) => {
        if (val.children.length === 0) {
          for (const key of Object.keys(val.constraints)) {
            errorMsgs.push(this.getKeyConstraints(key, val));
          }

          errorsObject[val.property] = errorMsgs;
          errorMsgs = [];
        } else {
          for (const child of val.children) {
            errorsObject[val.property] = {};

            if (isArray(child?.constraints)) {
              if (Object.keys(child.constraints).length > 0) {
                for (const key of Object.keys(child.constraints)) {
                  errorMsgs.push(this.getKeyConstraints(key, val, child));
                }

                errorsObject[val.property][child.property] = errorMsgs;
                errorMsgs = [];
              }
            }

            for (const nestedChild of child.children) {
              for (const key of Object.keys(nestedChild.constraints)) {
                errorMsgs.push(this.getKeyConstraints(key, val, nestedChild));
              }

              errorsObject[val.property][nestedChild.property] = errorMsgs;
              errorMsgs = [];
            }
          }
        }
      });

      const errorMessages = Object.values(errorsObject).flat();

      // using switch for readability
      let firstErrorMessage: string;
      switch (true) {
        case errorMessages.length > 0 && typeof errorMessages[0] === 'string':
          firstErrorMessage = errorMessages[0];
          break;
        case errorMessages.length > 0 && typeof errorMessages[0] === 'object':
          {
            const firstKey = errorMessages[0] && Object.keys(errorMessages[0])[0];
            firstErrorMessage =
              firstKey && errorMessages[0]?.[firstKey]?.[0]
                ? errorMessages[0][firstKey][0]
                : 'Have ' + errors.length + ' error(s)';
            break;
          }
        default:
          firstErrorMessage = 'Have ' + errors.length + ' error(s)';
      }

      throw new HttpException(
        {
          message: firstErrorMessage,
          ...errorsObject,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
