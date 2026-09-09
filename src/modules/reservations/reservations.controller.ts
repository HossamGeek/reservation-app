import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { CurrentUser } from 'src/libs/decorators/current-user.decorator';
import { ApiResponse } from 'src/libs/errors/api-response';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { CreateReservationDto } from './dto/request/create-reservation.dto';
import { ReservationsService } from './reservations.service';

@ApiTags('Reservations')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a reservation (authenticated client)',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or shift is inactive',
  })
  @ApiNotFoundResponse({ description: 'Service or shift not found' })
  @ApiConflictResponse({
    description: 'A reservation already exists for the shift and date',
  })
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() user: ILoginUser,
  ): Promise<ApiResponse> {
    await this.reservationsService.create(createReservationDto, user);

    return ApiResponse.successResponse(
      this.i18n.t('reservations.create.success'),
      {},
      201,
    );
  }
}
