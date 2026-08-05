import { applyDecorators } from '@nestjs/common';
import { IsString, MaxLength } from 'class-validator';

export function IsVarchar(maxLength: number = 255) {
  return applyDecorators(
    IsString(),
    MaxLength(maxLength, { message: `The value must not exceed ${maxLength} characters` })
  );
}
