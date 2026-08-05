import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
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
import { I18nService } from 'nestjs-i18n';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/request/create-category.dto';
import { UpdateCategoryDto } from './dto/request/update-category.dto';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import { getCategoriesPaginationConfig } from 'src/libs/pagination/categories.pagination';
import { ApiResponse } from 'src/libs/errors/api-response';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';

@ApiTags('Categories')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({
  description: 'Unauthorized. Missing or invalid token.',
})
@ApiForbiddenResponse({
  description: 'You do not have permission to access this resource.',
})
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly i18n: I18nService,
  ) { }

  @Can(CategoriesEnum.categories, ActionsEnum.create)
  @Post()
  @ApiOperation({ summary: 'Create category' })
  @ApiCreatedResponse({ description: 'Category created successfully' })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<ApiResponse> {
    await this.categoryService.create(createCategoryDto);

    return ApiResponse.successResponse(
      this.i18n.t('categories.create.success'),
      {},
      201,
    );
  }

  @Can(CategoriesEnum.categories, ActionsEnum.listView)
  @Get()
  @ApiOperation({ summary: 'Get all categories (paginated)' })
  @ApiPaginationQuery(getCategoriesPaginationConfig)
  @ApiOkResponse({ description: 'Categories retrieved successfully' })
  async findAll(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const categories = await this.categoryService.findAll(query);
    return ApiResponse.successResponse(
      this.i18n.t('categories.getAll.success'),
      { data: categories },
    );
  }

  @Can(CategoriesEnum.categories, ActionsEnum.update)
  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Category updated successfully' })
  async update(
    @Param() params: BigIntIdParamDto,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ApiResponse> {
    await this.categoryService.update(params.id, updateCategoryDto);

    return ApiResponse.successResponse(
      this.i18n.t('categories.update.success'),
      {},
    );
  }

  @Can(CategoriesEnum.categories, ActionsEnum.update)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update category activation status' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Category status updated successfully' })
  async updateStatus(
    @Param() params: BigIntIdParamDto,
    @Body() updateCategoryStatusDto: UpdateStatusDto,
  ): Promise<ApiResponse> {
    await this.categoryService.updateStatus(
      params.id,
      updateCategoryStatusDto,
    );

    return ApiResponse.successResponse(
      this.i18n.t('categories.update.success'),
      {},
    );
  }

  @Can(CategoriesEnum.categories, ActionsEnum.delete)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Category deleted successfully' })
  async remove(@Param() params: BigIntIdParamDto): Promise<ApiResponse> {
    await this.categoryService.remove(params.id);
    return ApiResponse.successResponse(
      this.i18n.t('categories.delete.success'),
    );
  }
}
