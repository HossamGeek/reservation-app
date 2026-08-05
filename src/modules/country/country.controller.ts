import { Body, Controller, Get, Patch, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { CountryService } from './country.service';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { ApiResponse } from 'src/libs/errors/api-response';
import { I18nService } from 'nestjs-i18n';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import {
  getCountriesPaginationConfig,
  getCountriesWithCitiesPaginationConfig,
} from 'src/libs/pagination/countries.pagination';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';

@ApiTags('Countries')
@ApiBearerAuth('JWT')
@Controller('countries')
export class CountryController {
  constructor(
    private readonly countryService: CountryService,
    private readonly i18n: I18nService,
  ) {}

  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Missing or invalid token.',
  })
  @Can(CategoriesEnum.countries, ActionsEnum.listView)
  @Get('with-cities')
  @ApiOperation({ summary: 'Get countries with their cities' })
  @ApiPaginationQuery(getCountriesWithCitiesPaginationConfig)
  @ApiOkResponse({
    description: 'Countries with cities retrieved successfully',
  })
  async findWithCities(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const countries = await this.countryService.findWithCities(query);
    return ApiResponse.successResponse(
      this.i18n.t('countries.getAll.success'),
      { countries },
    );
  }

  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Missing or invalid token.',
  })
  @Can(CategoriesEnum.countries, ActionsEnum.listView)
  @Get()
  @ApiOperation({ summary: 'Get all countries (paginated)' })
  @ApiPaginationQuery(getCountriesPaginationConfig)
  @ApiOkResponse({ description: 'Countries retrieved successfully' })
  async findAll(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const countries = await this.countryService.findAll(query);
    return ApiResponse.successResponse(
      this.i18n.t('countries.getAll.success'),
      { countries },
    );
  }

  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Missing or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to access this resource.',
  })
  @Can(CategoriesEnum.countries, ActionsEnum.update)
  @Patch('bulk-activation-status')
  @ApiOperation({ summary: 'Bulk update countries status' })
  @ApiOkResponse({ description: 'Countries status updated successfully' })
  async updateBulkStatus(
    @Body() updateCountryStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    await this.countryService.updateBulkStatus(updateCountryStatusDto);

    const messageKey = updateCountryStatusDto.isActive
      ? 'countries.update.bulkActivate.success'
      : 'countries.update.bulkDeactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey));
  }

  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Missing or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to access this resource.',
  })
  @Can(CategoriesEnum.countries, ActionsEnum.update)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update country activation status' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Country status updated successfully' })
  async updateStatus(
    @Param() params: BigIntIdParamDto,
    @Body() updateCountryStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    const { isActive } = updateCountryStatusDto;
    await this.countryService.updateStatus(params.id, isActive);

    const messageKey = isActive
      ? 'countries.activate.success'
      : 'countries.deactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey), {});
  }
}
