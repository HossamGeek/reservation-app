import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { ApiResponse } from 'src/libs/errors/api-response';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { CreateServiceDto } from './dto/request/create-service.dto';
import { ServicesStatisticsResponseDto } from './dto/response/services-statistics-response.dto';
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import { getServicesPaginationConfig } from 'src/libs/pagination/services.pagination';
import { ServiceDetailsResponseDto } from './dto/response/service-details-response.dto';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';
import { ServiceService } from './service.service';

@ApiTags('Services')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({
  description: 'Unauthorized. Missing or invalid token.',
})
@ApiForbiddenResponse({
  description: 'You do not have permission to access this resource.',
})
@Controller('services')
export class ServiceController {
  constructor(
    private readonly servicesService: ServiceService,
    private readonly i18n: I18nService,
  ) {}

  @Can(CategoriesEnum.services, ActionsEnum.create)
  @Post()
  @ApiOperation({ summary: 'Create service' })
  @ApiCreatedResponse({ description: 'Service created successfully' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiConflictResponse({
    description: 'Arabic or English service name already exists',
  })
  @ApiNotFoundResponse({ description: 'Category or service type not found' })
  async create(@Body() dto: CreateServiceDto): Promise<ApiResponse> {
    await this.servicesService.create(dto);

    return ApiResponse.successResponse(
      this.i18n.t('services.success.created'),
      {},
      201,
    );
  }

  @Can(CategoriesEnum.services, ActionsEnum.listView)
  @Get('statistics')
  @ApiOperation({ summary: 'Get services statistics' })
  @ApiOkResponse({ type: ServicesStatisticsResponseDto })
  async getStatistics(): Promise<ApiResponse> {
    const statistics = await this.servicesService.getStatistics();

    return ApiResponse.successResponse(
      this.i18n.t('services.success.statistics'),
      { data: statistics },
    );
  }

  @Can(CategoriesEnum.services, ActionsEnum.listView)
  @Get()
  @ApiOperation({ summary: 'Get all services (paginated)' })
  @ApiPaginationQuery(getServicesPaginationConfig)
  @ApiOkResponse({ description: 'Services retrieved successfully' })
  async findAll(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const services = await this.servicesService.findAll(query);

    return ApiResponse.successResponse(this.i18n.t('services.success.getAll'), {
      services,
    });
  }

  @Can(CategoriesEnum.services, ActionsEnum.detailedView)
  @Get(':id')
  @ApiOperation({ summary: 'Get service details' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ type: ServiceDetailsResponseDto })
  @ApiNotFoundResponse({ description: 'Service not found' })
  async findOne(@Param() params: BigIntIdParamDto): Promise<ApiResponse> {
    const service = await this.servicesService.findOne(params.id);

    return ApiResponse.successResponse(this.i18n.t('services.success.getOne'), {
      data: service,
    });
  }

  // @Can(CategoriesEnum.services, ActionsEnum.delete)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Service' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Service deleted successfully' })
  async remove(@Param() params: BigIntIdParamDto): Promise<ApiResponse> {
    await this.servicesService.remove(params.id);
    return ApiResponse.successResponse(this.i18n.t('services.delete'));
  }
}
