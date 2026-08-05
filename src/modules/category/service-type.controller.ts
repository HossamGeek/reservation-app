import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { ServiceTypeService } from './service-type.service';
import { ApiResponse } from 'src/libs/errors/api-response';
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { I18nService } from 'nestjs-i18n';
import { getServiceTypesPaginationConfig } from 'src/libs/pagination/services-types.pagination';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';

@ApiTags('Service Types')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({
  description: 'Unauthorized. Missing or invalid token.',
})
@ApiForbiddenResponse({
  description: 'You do not have permission to access this resource.',
})
@Controller('service-types')
export class ServiceTypeController {
  constructor(
    private readonly serviceTypeService: ServiceTypeService,
    private readonly i18n: I18nService,
  ) {}

  @Can(CategoriesEnum.serviceTypes, ActionsEnum.listView)
  @Get()
  @ApiOperation({ summary: 'Get all service types (paginated)' })
  @ApiPaginationQuery(getServiceTypesPaginationConfig)
  @ApiOkResponse({ description: 'Service types retrieved successfully' })
  async findAll(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const serviceTypes = await this.serviceTypeService.findAll(query);
    return ApiResponse.successResponse(
      this.i18n.t('services-types.getAll.success'),
      { data: serviceTypes },
    );
  }

  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Missing or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to access this resource.',
  })
  @Can(CategoriesEnum.serviceTypes, ActionsEnum.update)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update service type  activation status' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({
    description: 'Service type option status updated successfully',
  })
  async updateStatus(
    @Param() params: BigIntIdParamDto,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    await this.serviceTypeService.updateStatus(params.id, updateStatusDto);

    const messageKey = updateStatusDto.isActive
      ? 'services-types.activate.success'
      : 'services-types.deactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey), {});
  }
}
