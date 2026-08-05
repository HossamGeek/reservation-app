import { IsNotEmpty, IsString } from 'class-validator';

export class ValidatePasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;
}
