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
import { ExperienceService } from './experience.service';
import { UpdateExperienceDto } from './dto/request/update-experience.dto';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { ApiResponse } from 'src/libs/errors/api-response';
import { I18nService } from 'nestjs-i18n';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import { getExperiencesPaginationConfig } from 'src/libs/pagination/experiences.pagination';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';

@ApiTags('Experiences')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({
  description: 'Unauthorized. Missing or invalid token.',
})
@ApiForbiddenResponse({
  description: 'You do not have permission to access this resource.',
})
@Controller('experiences')
export class ExperienceController {
  constructor(
    private readonly experiencesService: ExperienceService,
    private readonly i18n: I18nService,
  ) {}

  // @Can(CategoriesEnum.experiences, ActionsEnum.create)
  // @Post()
  // @ApiOperation({ summary: 'Create a new experience range' })
  // @ApiOkResponse({ description: 'Experience range created successfully' })
  // async create(
  //   @Body() createExperienceDto: CreateExperienceDto,
  // ): Promise<ApiResponse> {
  //   await this.experiencesService.create(createExperienceDto);

  //   return ApiResponse.successResponse(
  //     this.i18n.t('experiences.create.success'),
  //     {},
  //     201,
  //   );
  // }

  @Can(CategoriesEnum.experiences, ActionsEnum.listView)
  @Get()
  @ApiOperation({ summary: 'Get all experience ranges (paginated)' })
  @ApiPaginationQuery(getExperiencesPaginationConfig)
  @ApiOkResponse({ description: 'Experience ranges retrieved successfully' })
  async findAll(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const experiences = await this.experiencesService.findAll(query);
    return ApiResponse.successResponse(
      this.i18n.t('experiences.getAll.success'),
      { experiences },
    );
  }

  @Can(CategoriesEnum.experiences, ActionsEnum.update)
  @Patch('bulk-activation-status')
  @ApiOperation({ summary: 'Bulk update experiences status' })
  @ApiOkResponse({ description: 'Experiences status updated successfully' })
  async updateBulkStatus(
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    await this.experiencesService.updateBulkStatus(updateStatusDto);

    const messageKey = updateStatusDto.isActive
      ? 'experiences.update.bulkActivate.success'
      : 'experiences.update.bulkDeactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey));
  }

  @Can(CategoriesEnum.experiences, ActionsEnum.update)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an experience range' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Experience range updated successfully' })
  async update(
    @Param() params: BigIntIdParamDto,
    @Body() updateExperienceDto: UpdateExperienceDto,
  ): Promise<ApiResponse> {
    await this.experiencesService.update(params.id, updateExperienceDto);

    return ApiResponse.successResponse(
      this.i18n.t('experiences.update.success'),
      {},
    );
  }

  @Can(CategoriesEnum.experiences, ActionsEnum.update)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update experience range activation status' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({
    description: 'Experience range status updated successfully',
  })
  async updateStatus(
    @Param() params: BigIntIdParamDto,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    const { isActive } = updateStatusDto;
    await this.experiencesService.updateStatus(params.id, isActive);

    const messageKey = isActive
      ? 'experiences.activate.success'
      : 'experiences.deactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey), {});
  }
}
