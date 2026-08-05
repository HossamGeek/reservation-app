import { ApiProperty } from '@nestjs/swagger';
import { IsBigIntId } from 'src/libs/decorators/is-bigint-id.decorator';

export class BigIntIdParamDto {
  @ApiProperty({
    description: 'Resource ID represented as BIGINT',
    type: String,
    example: '1',
  })
  @IsBigIntId()
  id: string;
}
