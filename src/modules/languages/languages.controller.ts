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
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { ApiResponse } from 'src/libs/errors/api-response';
import { languagesPaginationConfig } from 'src/libs/pagination/languages.pagination';
import { CreateLanguageDto } from './dto/request/create-language.dto';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { LanguagesService } from './languages.service';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';

@ApiTags('Languages')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({
  description: 'Unauthorized. Missing or invalid token.',
})
@ApiForbiddenResponse({
  description: 'You do not have permission to access this resource.',
})
@Controller('languages')
export class LanguagesController {
  constructor(
    private readonly languagesService: LanguagesService,
    private readonly i18n: I18nService,
  ) {}

  @Can(CategoriesEnum.languages, ActionsEnum.listView)
  @Get()
  @ApiOperation({ summary: 'Get languages' })
  @ApiPaginationQuery(languagesPaginationConfig)
  @ApiOkResponse({ description: 'Languages fetched successfully' })
  async findAll(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const languages = await this.languagesService.findAll(query);

    return ApiResponse.successResponse(
      this.i18n.t('languages.getAll.success'),
      {
        languages,
      },
    );
  }

  @Can(CategoriesEnum.languages, ActionsEnum.create)
  @Post()
  @ApiOperation({ summary: 'Create language' })
  @ApiCreatedResponse({ description: 'Language created successfully' })
  async create(
    @Body() createLanguageDto: CreateLanguageDto,
  ): Promise<ApiResponse> {
    const language = await this.languagesService.create(createLanguageDto);

    return ApiResponse.successResponse(
      this.i18n.t('languages.create.success'),
      { data: language },
      201,
    );
  }

  @Can(CategoriesEnum.languages, ActionsEnum.update)
  @Patch('bulk-activation-status')
  @ApiOperation({ summary: 'Bulk update languages status' })
  @ApiOkResponse({ description: 'Languages status updated successfully' })
  async updateBulkStatus(
    @Body() updateLanguageStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    await this.languagesService.updateBulkStatus(updateLanguageStatusDto);

    const messageKey = updateLanguageStatusDto.isActive
      ? 'languages.update.bulkActivate.success'
      : 'languages.update.bulkDeactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey));
  }

  @Can(CategoriesEnum.languages, ActionsEnum.update)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update language status' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Language status updated successfully' })
  async updateStatus(
    @Param() params: BigIntIdParamDto,
    @Body() updateLanguageStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    const language = await this.languagesService.updateStatus(
      params.id,
      updateLanguageStatusDto,
    );

    const messageKey = updateLanguageStatusDto.isActive
      ? 'languages.activate.success'
      : 'languages.deactivate.success';

    return ApiResponse.successResponse(this.i18n.t(messageKey), {
      data: language,
    });
  }
}
