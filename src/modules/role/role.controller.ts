import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/request/create-role.dto';
import { UpdateRoleDto } from './dto/request/update-role.dto';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { ApiResponse } from 'src/libs/errors/api-response';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { I18nService } from 'nestjs-i18n';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';

@ApiTags('Roles')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({
  description: 'Unauthorized. Missing or invalid token.',
})
@ApiForbiddenResponse({
  description: 'You do not have permission to access this resource.',
})
@Controller('roles')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly i18n: I18nService,
  ) {}

  @Can(CategoriesEnum.roles, ActionsEnum.create)
  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiCreatedResponse({ description: 'Role created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<ApiResponse> {
    const role = await this.roleService.create(createRoleDto);
    return ApiResponse.successResponse(
      this.i18n.t('roles.create.success'),
      { data: role },
      201,
    );
  }

  @Can(CategoriesEnum.roles, ActionsEnum.listView)
  @Get()
  @ApiOperation({ summary: 'Get all roles (paginated)' })
  @ApiOkResponse({ description: 'Roles retrieved successfully' })
  async findAll(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const roles = await this.roleService.findAll(query);
    return ApiResponse.successResponse(
      this.i18n.t('roles.getAll.success'),
      { roles },
      200,
    );
  }

  @Can(CategoriesEnum.roles, ActionsEnum.detailedView)
  @Get(':id')
  @ApiOperation({ summary: 'Get role by id' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Role retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  async findOne(@Param() params: BigIntIdParamDto) {
    const role = await this.roleService.findOne(params.id);

    return ApiResponse.successResponse(
      this.i18n.t('roles.getOne.success'),
      { data: role },
      200,
    );
  }

  @Can(CategoriesEnum.roles, ActionsEnum.update)
  @Patch(':id')
  @ApiOperation({ summary: 'Update role' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Role updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid update data' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  async update(
    @Param() params: BigIntIdParamDto,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<ApiResponse> {
    const role = await this.roleService.update(params.id, updateRoleDto);
    return ApiResponse.successResponse(
      this.i18n.t('roles.update.success'),
      { data: role },
      200,
    );
  }

  @Can(CategoriesEnum.roles, ActionsEnum.delete)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiOkResponse({ description: 'Role deleted successfully' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  async forceDelete(@Param() params: BigIntIdParamDto) {
    await this.roleService.forceDelete(params.id);
    return ApiResponse.successResponse(
      this.i18n.t('roles.delete.success'),
      {},
      200,
    );
  }
}
