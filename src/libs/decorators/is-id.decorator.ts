import { applyDecorators } from '@nestjs/common';
import { IsNumber, IsPositive, IsNotEmpty, IsInt } from 'class-validator';

export function IsId() {
  return applyDecorators(
    IsNotEmpty({ message: 'The value must not be empty' }),
    IsNumber({}, { message: 'The value must be a number' }),
    IsPositive({ message: 'The value must be a positive number' }),
    IsInt({ message: 'The value must be an integer' }),
  );
}
