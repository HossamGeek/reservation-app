import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DayService } from './day.service';
import { ApiResponse } from 'src/libs/errors/api-response';
import { I18nService } from 'nestjs-i18n';
import { DayResponseDto } from './dto/response/day-response.dto';

@ApiTags('Days')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({
  description: 'Unauthorized. Missing or invalid token.',
})
@Controller('days')
export class DayController {
  constructor(
    private readonly dayService: DayService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all days of the week' })
  @ApiOkResponse({
    description: 'Days retrieved successfully',
    type: DayResponseDto,
    isArray: true,
  })
  async findAll(): Promise<ApiResponse> {
    const days = await this.dayService.findAll();
    return ApiResponse.successResponse(
      this.i18n.t('days.getAll.success'),
      { days },
    );
  }
}
