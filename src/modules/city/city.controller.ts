import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { CityService } from './city.service';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { ApiResponse } from 'src/libs/errors/api-response';
import { I18nService } from 'nestjs-i18n';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import { getCitiesPaginationConfig } from 'src/libs/pagination/cities.pagination';
import { CreateCityDto } from './dto/request/create-city.dto';
import { Public } from 'src/libs/decorators/public.decorator';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';

@ApiTags('Cities')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({
  description: 'Unauthorized. Missing or invalid token.',
})
@ApiForbiddenResponse({
  description: 'You do not have permission to access this resource.',
})
@Controller('cities')
export class CityController {
  constructor(
    private readonly cityService: CityService,
    private readonly i18n: I18nService,
  ) {}

  @Can(CategoriesEnum.cities, ActionsEnum.listView)
  @Get()
  @ApiOperation({ summary: 'Get all cities (paginated)' })
  @ApiPaginationQuery(getCitiesPaginationConfig)
  @ApiOkResponse({ description: 'Cities retrieved successfully' })
  async findAll(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const cities = await this.cityService.findAll(query);
    return ApiResponse.successResponse(this.i18n.t('cities.getAll.success'), {
      cities,
    });
  }

  @Public()
  @Get('saudi-arabia')
  @ApiOperation({ summary: 'Get active cities in Saudi Arabia' })
  @ApiPaginationQuery(getCitiesPaginationConfig)
  @ApiOkResponse({ description: 'Saudi Arabia cities retrieved successfully' })
  async getSaudiArabiaCities(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const cities = await this.cityService.getSaudiArabiaCities(query);
    return ApiResponse.successResponse(this.i18n.t('cities.getAll.success'), {
      cities,
    });
  }

  @Can(CategoriesEnum.cities, ActionsEnum.update)
  @Patch('bulk-activation-status')
  @ApiOperation({ summary: 'Bulk update cities status' })
  @ApiOkResponse({ description: 'Cities status updated successfully' })
  async updateBulkStatus(
    @Body() updateCityStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    await this.cityService.updateBulkStatus(updateCityStatusDto);

    const messageKey = updateCityStatusDto.isActive
      ? 'cities.update.bulkActivate.success'
      : 'cities.update.bulkDeactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey));
  }

  @Can(CategoriesEnum.cities, ActionsEnum.update)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update city activation status' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'City status updated successfully' })
  async updateStatus(
    @Param() params: BigIntIdParamDto,
    @Body() updateCityStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    const { isActive } = updateCityStatusDto;
    await this.cityService.updateStatus(params.id, isActive);

    const messageKey = isActive
      ? 'cities.activate.success'
      : 'cities.deactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey), {});
  }

  @Can(CategoriesEnum.cities, ActionsEnum.create)
  @Post()
  @ApiOperation({ summary: 'Create a new city' })
  @ApiOkResponse({ description: 'City created successfully' })
  async create(@Body() createCityDto: CreateCityDto): Promise<ApiResponse> {
    await this.cityService.create(createCityDto);
    return ApiResponse.successResponse(
      this.i18n.t('cities.create.success'),
      {},
      201,
    );
  }
}
