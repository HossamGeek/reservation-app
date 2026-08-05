import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import { Public } from 'src/libs/decorators/public.decorator';
import { ApiResponse } from 'src/libs/errors/api-response';
import { getServiceTypesPaginationConfig } from 'src/libs/pagination/services-types.pagination';
import { getServicesPaginationConfig } from 'src/libs/pagination/services.pagination';
import { ServiceTypeService } from '../category/service-type.service';
import { ServiceService } from './service.service';

@ApiTags('Mobile Services')
@Public()
@Controller('client/services')
export class MobileServiceController {
  constructor(
    private readonly servicesService: ServiceService,
    private readonly serviceTypeService: ServiceTypeService,
    private readonly i18n: I18nService,
  ) {}
  @Get()
  @ApiOperation({ summary: 'Get all services (paginated)' })
  @ApiPaginationQuery(getServicesPaginationConfig)
  @ApiOkResponse({ description: 'Services retrieved successfully' })
  async findAll(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const services = await this.servicesService.findAll(query, {
      isMobile: true,
    });

    return ApiResponse.successResponse(this.i18n.t('services.success.getAll'), {
      services,
    });
  }

  @Get('/types')
  @ApiOperation({ summary: 'Get all service types (paginated)' })
  @ApiPaginationQuery(getServiceTypesPaginationConfig)
  @ApiOkResponse({ description: 'Services Types retrieved successfully' })
  async findAllServiceTypes(@Paginate() query: PaginateQuery) {
    return await this.serviceTypeService.findAll(query, {
      isMobile: true,
    });
  }
}
