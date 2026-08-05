import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ShiftService } from './shift.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { CreateShiftDto } from './dto/request/create-shift.dto';
import { UpdateShiftDto } from './dto/request/update-shift.dto';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { ApiResponse } from 'src/libs/errors/api-response';
import { I18nService } from 'nestjs-i18n';
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import { getProviderShiftsPaginationConfig } from 'src/libs/pagination/provider-shifts.pagination';
import { CurrentUser } from 'src/libs/decorators/current-user.decorator';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';

@ApiTags('Shifts')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
@Controller('shifts')
export class ShiftController {
  constructor(
    private readonly shiftsService: ShiftService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @Can(CategoriesEnum.shifts, ActionsEnum.listView)
  @ApiOperation({ summary: 'Get authenticated provider shifts' })
  @ApiPaginationQuery(getProviderShiftsPaginationConfig)
  @ApiOkResponse({ description: 'Shifts retrieved successfully' })
  @ApiBadRequestResponse({
    description: 'Invalid pagination, search, filter, or sorting parameters',
  })
  async findAll(
    @Paginate() query: PaginateQuery,
    @CurrentUser() user: ILoginUser,
  ): Promise<ApiResponse> {
    const shifts = await this.shiftsService.findAll(query, user);

    return ApiResponse.successResponse(this.i18n.t('shifts.getAll.success'), {
      shifts,
    });
  }

  @Post()
  @Can(CategoriesEnum.shifts, ActionsEnum.create)
  @ApiOperation({ summary: 'Create a new shift' })
  @ApiCreatedResponse({ description: 'Shift created successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Provider not found' })
  @ApiUnprocessableEntityResponse({
    description: 'Any unprocessable entity error',
  })
  async create(@Body() createShiftDto: CreateShiftDto): Promise<ApiResponse> {
    await this.shiftsService.create(createShiftDto);
    return ApiResponse.successResponse(
      this.i18n.t('shifts.create.success'),
      {},
      201,
    );
  }

  @Patch(':id')
  @Can(CategoriesEnum.shifts, ActionsEnum.update)
  @ApiOperation({ summary: 'Update an existing shift' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Shift updated successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Shift not found' })
  @ApiUnprocessableEntityResponse({
    description: 'Any unexpected error',
  })
  async update(
    @Param() params: BigIntIdParamDto,
    @Body() updateShiftDto: UpdateShiftDto,
  ): Promise<ApiResponse> {
    await this.shiftsService.update(params.id, updateShiftDto);
    return ApiResponse.successResponse(
      this.i18n.t('shifts.update.success'),
      {},
      200,
    );
  }

  @Can(CategoriesEnum.shifts, ActionsEnum.update)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update shift active status' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Shift status updated successfully' })
  async updateStatus(
    @Param() params: BigIntIdParamDto,
    @Body() updateShiftStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    const { isActive } = updateShiftStatusDto;
    await this.shiftsService.updateStatus(params.id, isActive);

    const messageKey = isActive
      ? 'shifts.activate.success'
      : 'shifts.deactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey), {});
  }
}
