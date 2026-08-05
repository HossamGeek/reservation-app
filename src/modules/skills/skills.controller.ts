import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
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
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import { I18nService } from 'nestjs-i18n';
import { ApiResponse } from 'src/libs/errors/api-response';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { getSkillsPaginationConfig } from 'src/libs/pagination/skills.pagination';
import { CreateSkillDto } from './dto/request/create-skill.dto';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { SkillsService } from './skills.service';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';

@ApiTags('Skills')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({
  description: 'Unauthorized. Missing or invalid token.',
})
@ApiForbiddenResponse({
  description: 'You do not have permission to access this resource.',
})
@Controller('skills')
export class SkillsController {
  constructor(
    private readonly skillsService: SkillsService,
    private readonly i18n: I18nService,
  ) {}

  @Can(CategoriesEnum.skills, ActionsEnum.listView)
  @Get()
  @ApiOperation({ summary: 'Get skills' })
  @ApiPaginationQuery(getSkillsPaginationConfig)
  @ApiOkResponse({ description: 'Skills fetched successfully' })
  async findAll(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const skills = await this.skillsService.findAll(query);

    return ApiResponse.successResponse(this.i18n.t('skills.getAll.success'), {
      skills,
    });
  }

  @Can(CategoriesEnum.skills, ActionsEnum.create)
  @Post()
  @ApiOperation({ summary: 'Create skill' })
  @ApiCreatedResponse({ description: 'Skill created successfully' })
  async create(@Body() createSkillDto: CreateSkillDto): Promise<ApiResponse> {
    const skill = await this.skillsService.create(createSkillDto);

    return ApiResponse.successResponse(
      this.i18n.t('skills.create.success'),
      { data: skill },
      201,
    );
  }

  @Can(CategoriesEnum.skills, ActionsEnum.update)
  @Patch('bulk-activation-status')
  @ApiOperation({ summary: 'Bulk update skills status' })
  @ApiOkResponse({ description: 'Skills status updated successfully' })
  async updateBulkStatus(
    @Body() updateSkillStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    await this.skillsService.updateBulkStatus(updateSkillStatusDto);

    const messageKey = updateSkillStatusDto.isActive
      ? 'skills.update.bulkActivate.success'
      : 'skills.update.bulkDeactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey));
  }

  @Can(CategoriesEnum.skills, ActionsEnum.update)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update skill status' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Skill status updated successfully' })
  async updateStatus(
    @Param() params: BigIntIdParamDto,
    @Body() updateSkillStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    const skill = await this.skillsService.updateStatus(
      params.id,
      updateSkillStatusDto,
    );

    const messageKey = updateSkillStatusDto.isActive
      ? 'skills.activate.success'
      : 'skills.deactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey), {
      data: skill,
    });
  }
}
