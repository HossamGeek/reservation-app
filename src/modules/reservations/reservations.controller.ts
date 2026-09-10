import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { CurrentUser } from 'src/libs/decorators/current-user.decorator';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
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

  @Patch(':id/confirm')
  @Can(CategoriesEnum.reservations, ActionsEnum.update)
  @ApiOperation({
    summary: 'Confirm a reservation (authenticated provider admin)',
  })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Reservation confirmed successfully' })
  @ApiNotFoundResponse({ description: 'Reservation not found' })
  @ApiConflictResponse({
    description: 'Reservation is not pending or was already changed',
  })
  async confirm(
    @Param() params: BigIntIdParamDto,
    @CurrentUser() user: ILoginUser,
  ): Promise<ApiResponse> {
    await this.reservationsService.confirm(params.id, user);

    return ApiResponse.successResponse(
      this.i18n.t('reservations.confirm.success'),
      {},
      200,
    );
  }
}
