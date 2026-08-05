import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { CreateServiceTypeOptionDto } from './dto/request/create-service-type-option.dto';
import { ServiceTypeOptionService } from './service-type-option.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { ApiResponse } from 'src/libs/errors/api-response';
import { I18nService } from 'nestjs-i18n';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';

@ApiTags('Service Type Options')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({
  description: 'Unauthorized. Missing or invalid token.',
})
@ApiForbiddenResponse({
  description: 'You do not have permission to access this resource.',
})
@Controller('service-type-options')
export class ServiceTypeOptionController {
  constructor(
    private readonly serviceTypeOptionService: ServiceTypeOptionService,
    private readonly i18n: I18nService,
  ) {}

  @Can(CategoriesEnum.serviceTypeOptions, ActionsEnum.create)
  @Post()
  @ApiOperation({ summary: 'Create service type option' })
  @ApiCreatedResponse({
    description: 'Service type option created successfully',
  })
  async create(
    @Body() createServiceTypeOptionDto: CreateServiceTypeOptionDto,
  ): Promise<ApiResponse> {
    await this.serviceTypeOptionService.create(createServiceTypeOptionDto);

    return ApiResponse.successResponse(
      this.i18n.t('service-type-options.create.success'),
      {},
      201,
    );
  }

  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Missing or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to access this resource.',
  })
  @Can(CategoriesEnum.serviceTypeOptions, ActionsEnum.update)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update service type option activation status' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({
    description: 'Service type option status updated successfully',
  })
  async updateStatus(
    @Param() params: BigIntIdParamDto,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    await this.serviceTypeOptionService.updateStatus(params.id, updateStatusDto);

    const messageKey = updateStatusDto.isActive
      ? 'service-type-options.activate.success'
      : 'service-type-options.deactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey), {});
  }
}
