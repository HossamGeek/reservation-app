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
import { NationalityService } from './nationality.service';
import { CreateNationalityDto } from './dto/request/create-nationality.dto';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { ApiResponse } from 'src/libs/errors/api-response';
import { I18nService } from 'nestjs-i18n';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import { getNationalitiesPaginationConfig } from 'src/libs/pagination/nationalities.pagination';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';

@ApiTags('Nationalities')
@ApiBearerAuth('JWT')
@Controller('nationalities')
export class NationalityController {
  constructor(
    private readonly nationalityService: NationalityService,
    private readonly i18n: I18nService,
  ) {}

  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Missing or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to access this resource.',
  })
  @Can(CategoriesEnum.nationalities, ActionsEnum.create)
  @Post()
  @ApiOperation({ summary: 'Create a new nationality' })
  @ApiOkResponse({ description: 'Nationality created successfully' })
  async create(
    @Body() createNationalityDto: CreateNationalityDto,
  ): Promise<ApiResponse> {
    await this.nationalityService.create(createNationalityDto);

    return ApiResponse.successResponse(
      this.i18n.t('nationalities.create.success'),
      {},
      201,
    );
  }

  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Missing or invalid token.',
  })
  @Can(CategoriesEnum.nationalities, ActionsEnum.listView)
  @Get()
  @ApiOperation({ summary: 'Get all nationalities (paginated)' })
  @ApiPaginationQuery(getNationalitiesPaginationConfig)
  @ApiOkResponse({ description: 'Nationalities retrieved successfully' })
  async findAll(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const nationalities = await this.nationalityService.findAll(query);
    return ApiResponse.successResponse(
      this.i18n.t('nationalities.getAll.success'),
      { nationalities },
    );
  }

  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Missing or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to access this resource.',
  })
  @Can(CategoriesEnum.nationalities, ActionsEnum.update)
  @Patch('bulk-activation-status')
  @ApiOperation({ summary: 'Bulk update nationalities status' })
  @ApiOkResponse({ description: 'Nationalities status updated successfully' })
  async updateBulkStatus(
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    await this.nationalityService.updateBulkStatus(updateStatusDto);

    const messageKey = updateStatusDto.isActive
      ? 'nationalities.update.bulkActivate.success'
      : 'nationalities.update.bulkDeactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey));
  }

  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Missing or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to access this resource.',
  })
  @Can(CategoriesEnum.nationalities, ActionsEnum.update)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update nationality activation status' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Nationality status updated successfully' })
  async updateStatus(
    @Param() params: BigIntIdParamDto,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    const { isActive } = updateStatusDto;
    await this.nationalityService.updateStatus(params.id, isActive);

    const messageKey = isActive
      ? 'nationalities.activate.success'
      : 'nationalities.deactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey), {});
  }
}
