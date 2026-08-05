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
import { ReligionService } from './religion.service';
import { CreateReligionDto } from './dto/request/create-religion.dto';
import { UpdateReligionDto } from './dto/request/update-religion.dto';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { ApiResponse } from 'src/libs/errors/api-response';
import { I18nService } from 'nestjs-i18n';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import { getReligionsPaginationConfig } from 'src/libs/pagination/religions.pagination';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';

@ApiTags('Religions')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({
  description: 'Unauthorized. Missing or invalid token.',
})
@ApiForbiddenResponse({
  description: 'You do not have permission to access this resource.',
})
@Controller('religions')
export class ReligionController {
  constructor(
    private readonly religionsService: ReligionService,
    private readonly i18n: I18nService,
  ) {}

  @Can(CategoriesEnum.religions, ActionsEnum.create)
  @Post()
  @ApiOperation({ summary: 'Create a new religion' })
  @ApiOkResponse({ description: 'Religion created successfully' })
  async create(
    @Body() createReligionDto: CreateReligionDto,
  ): Promise<ApiResponse> {
    await this.religionsService.create(createReligionDto);

    return ApiResponse.successResponse(
      this.i18n.t('religions.create.success'),
      {},
      201,
    );
  }

  @Can(CategoriesEnum.religions, ActionsEnum.listView)
  @Get()
  @ApiOperation({ summary: 'Get all religions (paginated)' })
  @ApiPaginationQuery(getReligionsPaginationConfig)
  @ApiOkResponse({ description: 'Religions retrieved successfully' })
  async findAll(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const religions = await this.religionsService.findAll(query);
    return ApiResponse.successResponse(
      this.i18n.t('religions.getAll.success'),
      { religions },
    );
  }

  @Can(CategoriesEnum.religions, ActionsEnum.update)
  @Patch('bulk-activation-status')
  @ApiOperation({ summary: 'Bulk update religions status' })
  @ApiOkResponse({ description: 'Religions status updated successfully' })
  async updateBulkStatus(
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    await this.religionsService.updateBulkStatus(updateStatusDto);

    const messageKey = updateStatusDto.isActive
      ? 'religions.update.bulkActivate.success'
      : 'religions.update.bulkDeactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey));
  }

  @Can(CategoriesEnum.religions, ActionsEnum.update)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a religion' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Religion updated successfully' })
  async update(
    @Param() params: BigIntIdParamDto,
    @Body() updateReligionDto: UpdateReligionDto,
  ): Promise<ApiResponse> {
    await this.religionsService.update(params.id, updateReligionDto);

    return ApiResponse.successResponse(
      this.i18n.t('religions.update.success'),
      {},
    );
  }

  @Can(CategoriesEnum.religions, ActionsEnum.update)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update religion activation status' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Religion status updated successfully' })
  async updateStatus(
    @Param() params: BigIntIdParamDto,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    const { isActive } = updateStatusDto;
    await this.religionsService.updateStatus(params.id, isActive);

    const messageKey = isActive
      ? 'religions.activate.success'
      : 'religions.deactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey), {});
  }
}
