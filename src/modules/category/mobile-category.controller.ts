import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import { Public } from 'src/libs/decorators/public.decorator';
import { ApiResponse } from 'src/libs/errors/api-response';
import { getCategoriesPaginationConfig } from 'src/libs/pagination/categories.pagination';
import { CategoryService } from './category.service';

@ApiTags('Mobile Categories')
@Public()
@Controller('client/categories')
export class MobileCategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories (paginated)' })
  @ApiPaginationQuery(getCategoriesPaginationConfig)
  @ApiOkResponse({ description: 'Categories retrieved successfully' })
  async findAll(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const categories = await this.categoryService.findAll(query, {
      isMobile: true,
    });
    return ApiResponse.successResponse(
      this.i18n.t('categories.getAll.success'),
      { data: categories },
    );
  }
}
