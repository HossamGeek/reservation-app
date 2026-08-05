import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import { CurrentUser } from 'src/libs/decorators/current-user.decorator';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { Public } from 'src/libs/decorators/public.decorator';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { ApiResponse } from 'src/libs/errors/api-response';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { getProviderRequestsPaginationConfig } from 'src/libs/pagination/provider-join-requests.pagination';
import { CreateProviderDto } from './dto/request/create-provider.dto';
import { UpdateProviderApplicationStatusDto } from './dto/request/update-provider-application-status.dto';
import { UpdateProviderDto } from './dto/request/update-provider.dto';
import { ProviderDetailsResponseDto } from './dto/response/provider-details-response.dto';
import { ProviderPendingRequestDetailsResponseDto } from './dto/response/provider-pending-request-details-response.dto';
import { ProviderService } from './provider.service';

@ApiTags('Providers')
@ApiBadRequestResponse({ description: 'Invalid input data' })
@ApiUnauthorizedResponse({
  description: 'Unauthorized. Missing or invalid token.',
})
@ApiForbiddenResponse({
  description: 'You do not have permission to access this resource.',
})
@ApiBearerAuth('JWT')
@Controller('providers')
export class ProviderController {
  constructor(
    private readonly providerService: ProviderService,
    private readonly i18n: I18nService,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new provider' })
  @ApiCreatedResponse({ description: 'Provider created successfully' })
  async create(
    @Body() createProviderDto: CreateProviderDto,
    @CurrentUser() user: ILoginUser,
  ): Promise<ApiResponse> {
    await this.providerService.create(createProviderDto, user);

    return ApiResponse.successResponse(
      this.i18n.t('providers.created'),
      {},
      201,
    );
  }

  @Get('join-request/:id')
  @ApiOperation({ summary: 'Get office pending request details' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({
    description: 'Office pending request retrieved successfully',
    type: ProviderPendingRequestDetailsResponseDto,
  })
  async findPendingProvider(
    @Param() params: BigIntIdParamDto,
    @CurrentUser() user: ILoginUser,
  ): Promise<ApiResponse> {
    const provider = await this.providerService.findPendingProvider(
      params.id,
      user,
    );

    return ApiResponse.successResponse(this.i18n.t('providers.get.success'), {
      data: provider,
    });
  }

  @Can(CategoriesEnum.providers, ActionsEnum.listView)
  @Get()
  @ApiOperation({ summary: 'Get all approved provider requests' })
  @ApiOkResponse({
    description: 'Approved providers requests retrieved successfully',
  })
  @ApiPaginationQuery(getProviderRequestsPaginationConfig)
  async findAll(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const providers = await this.providerService.findAll(query);

    return ApiResponse.successResponse(this.i18n.t('providers.list.success'), {
      providers,
    });
  }

  @Can(CategoriesEnum.providers, ActionsEnum.listView)
  @Get('join-requests')
  @ApiOperation({ summary: 'Get all provider join requests (paginated)' })
  @ApiOkResponse({
    description: 'Provider join requests retrieved successfully',
  })
  @ApiPaginationQuery(getProviderRequestsPaginationConfig)
  async findAllJoinRequests(
    @Paginate() query: PaginateQuery,
  ): Promise<ApiResponse> {
    const joinRequests = await this.providerService.findAllJoinRequests(query);

    return ApiResponse.successResponse(this.i18n.t('providers.list.success'), {
      joinRequests,
    });
  }

  @Can(CategoriesEnum.providers, ActionsEnum.review)
  @Patch(':id/application-status')
  @ApiOperation({ summary: 'Approve or reject a provider application' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({
    description: 'Provider application status updated successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or verification requirements not met.',
  })
  async updateApplicationStatus(
    @Param() params: BigIntIdParamDto,
    @Body() updateDto: UpdateProviderApplicationStatusDto,
    @CurrentUser() user: ILoginUser,
  ): Promise<ApiResponse> {
    await this.providerService.updateApplicationStatus(
      params.id,
      updateDto,
      user,
    );

    return ApiResponse.successResponse(
      this.i18n.t('providers.application.reviewed'),
      {},
    );
  }

  @Patch()
  @ApiOperation({ summary: 'Update provider information' })
  @ApiOkResponse({
    description: 'Provider information updated successfully.',
  })
  async update(
    @Body() updateDto: UpdateProviderDto,
    @CurrentUser() user: ILoginUser,
  ): Promise<ApiResponse> {
    const provider = await this.providerService.update(updateDto, user);

    return ApiResponse.successResponse(
      this.i18n.t('providers.update.success'),
      { data: provider },
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get office details' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({
    description: 'Office retrieved successfully',
    type: ProviderDetailsResponseDto,
  })
  async findProviderDetails(
    @Param() params: BigIntIdParamDto,
    @CurrentUser() user: ILoginUser,
  ): Promise<ApiResponse> {
    const provider = await this.providerService.findProviderDetails(
      params.id,
      user,
    );

    return ApiResponse.successResponse(this.i18n.t('providers.get.success'), {
      data: provider,
    });
  }

  @Can(CategoriesEnum.providers, ActionsEnum.detailedView)
  @Get(':id/documents')
  @ApiOperation({ summary: 'Get provider documents' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({
    description: 'Provider documents retrieved successfully.',
  })
  async findProviderDocuments(
    @Param() params: BigIntIdParamDto,
    @CurrentUser() user: ILoginUser,
  ): Promise<ApiResponse> {
    const documents = await this.providerService.findProviderDocuments(
      params.id,
      user,
    );

    return ApiResponse.successResponse(
      this.i18n.t('providers.get.documents.success'),
      {
        documents,
      },
    );
  }
}
