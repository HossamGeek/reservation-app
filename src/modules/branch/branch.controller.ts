import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/request/create-branch.dto';
import { ApiResponse } from 'src/libs/errors/api-response';
import { I18nService } from 'nestjs-i18n';
import { CurrentUser } from 'src/libs/decorators/current-user.decorator';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { getBranchesPaginationConfig } from 'src/libs/pagination/branches.pagination';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';

@ApiTags('Branches')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({
  description: 'Unauthorized. Missing or invalid token.',
})
@ApiForbiddenResponse({
  description: 'You do not have permission to access this resource.',
})
@Controller('branches')
export class BranchController {
  constructor(
    private readonly branchService: BranchService,
    private readonly i18n: I18nService,
  ) {}

  @Can(CategoriesEnum.branches, ActionsEnum.listView)
  @Get()
  @ApiOperation({ description: 'Get all branches.',})
  @ApiPaginationQuery(getBranchesPaginationConfig)
  @ApiOkResponse({ description: 'Branches retrieved successfully' })
  async findAll(
    @Paginate() query: PaginateQuery,
    @CurrentUser() user: ILoginUser,
  ): Promise<ApiResponse> {
    const branches = await this.branchService.findAll(query, user);

    return ApiResponse.successResponse(this.i18n.t('branches.getAll.success'), {
      branches,
    });
  }

  @Post()
  @Can(CategoriesEnum.branches, ActionsEnum.create)
  @ApiOperation({ summary: 'Create a new branch' })
  @ApiCreatedResponse({ description: 'Branch created successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({
    description: 'Provider or city not found',
  })
  async create(
    @Body() createBranchDto: CreateBranchDto,
    @CurrentUser() user: ILoginUser,
  ): Promise<ApiResponse> {
    await this.branchService.create(createBranchDto, user);

    return ApiResponse.successResponse(
      this.i18n.t('branches.create.success'),
      {},
      201,
    );
  }

  @Get(':id')
  @Can(CategoriesEnum.branches, ActionsEnum.detailedView)
  @ApiOperation({ summary: 'Get branch details' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Branch retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Branch not found' })
  async findOne(
    @Param() params: BigIntIdParamDto,
    @CurrentUser() user: ILoginUser,
  ): Promise<ApiResponse> {
    const branch = await this.branchService.findOne(params.id, user);

    return ApiResponse.successResponse(
      this.i18n.t('branches.getOne.success'),
      { data: branch },
    );
  }
}
