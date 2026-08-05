import { Body, Controller, Get, Patch, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/request/create-position.dto';
import { UpdatePositionDto } from './dto/request/update-position.dto';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { ApiResponse } from 'src/libs/errors/api-response';
import { I18nService } from 'nestjs-i18n';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import { getPositionsPaginationConfig } from 'src/libs/pagination/positions.pagination';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';

@ApiTags('Positions')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({
  description: 'Unauthorized. Missing or invalid token.',
})
@ApiForbiddenResponse({
  description: 'You do not have permission to access this resource.',
})
@Controller('positions')
export class PositionController {
  constructor(
    private readonly positionsService: PositionService,
    private readonly i18n: I18nService,
  ) {}

  @Can(CategoriesEnum.positions, ActionsEnum.create)
  @Post()
  @ApiOperation({ summary: 'Create a new position' })
  @ApiOkResponse({ description: 'Position created successfully' })
  async create(
    @Body() createPositionDto: CreatePositionDto,
  ): Promise<ApiResponse> {
    await this.positionsService.create(createPositionDto);

    return ApiResponse.successResponse(
      this.i18n.t('positions.create.success'),
      {},
      201,
    );
  }

  @Can(CategoriesEnum.positions, ActionsEnum.listView)
  @Get()
  @ApiOperation({ summary: 'Get all positions (paginated)' })
  @ApiPaginationQuery(getPositionsPaginationConfig)
  @ApiOkResponse({ description: 'Positions retrieved successfully' })
  async findAll(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const positions = await this.positionsService.findAll(query);
    return ApiResponse.successResponse(
      this.i18n.t('positions.getAll.success'),
      { positions },
    );
  }

  @Can(CategoriesEnum.positions, ActionsEnum.update)
  @Patch('bulk-activation-status')
  @ApiOperation({ summary: 'Bulk update positions status' })
  @ApiOkResponse({ description: 'Positions status updated successfully' })
  async updateBulkStatus(
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    await this.positionsService.updateBulkStatus(updateStatusDto);

    const messageKey = updateStatusDto.isActive
      ? 'positions.update.bulkActivate.success'
      : 'positions.update.bulkDeactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey));
  }

  @Can(CategoriesEnum.positions, ActionsEnum.update)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a position' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Position updated successfully' })
  async update(
    @Param() params: BigIntIdParamDto,
    @Body() updatePositionDto: UpdatePositionDto,
  ): Promise<ApiResponse> {
    await this.positionsService.update(params.id, updatePositionDto);

    return ApiResponse.successResponse(
      this.i18n.t('positions.update.success'),
      {},
    );
  }

  @Can(CategoriesEnum.positions, ActionsEnum.update)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update position activation status' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Position status updated successfully' })
  async updateStatus(
    @Param() params: BigIntIdParamDto,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    const { isActive } = updateStatusDto;
    await this.positionsService.updateStatus(params.id, isActive);

    const messageKey = isActive
      ? 'positions.activate.success'
      : 'positions.deactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey), {});
  }
}
