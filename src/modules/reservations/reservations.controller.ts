import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import { CurrentUser } from 'src/libs/decorators/current-user.decorator';
import { ApiResponse } from 'src/libs/errors/api-response';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { getProviderReservationsPaginationConfig } from 'src/libs/pagination/provider-reservations.pagination';
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

  @Get()
  //@Can(CategoriesEnum.reservations, ActionsEnum.view)
  @ApiOperation({
    summary: 'Get authenticated provider reservations (paginated)',
  })
  @ApiPaginationQuery(getProviderReservationsPaginationConfig)
  @ApiOkResponse({ description: 'Reservations retrieved successfully' })
  @ApiBadRequestResponse({
    description: 'Invalid pagination, search, filter, or sorting parameters',
  })
  async findAll(
    @Paginate() query: PaginateQuery,
    @CurrentUser() user: ILoginUser,
  ): Promise<ApiResponse> {
    const reservations =
      await this.reservationsService.findProviderReservations(query, user);

    return ApiResponse.successResponse(
      this.i18n.t('reservations.getAll.success'),
      { reservations },
    );
  }

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
