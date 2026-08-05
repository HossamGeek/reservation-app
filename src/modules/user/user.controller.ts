import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { ApiResponse } from 'src/libs/errors/api-response';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { ApiParam } from '@nestjs/swagger';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Can(CategoriesEnum.users, ActionsEnum.create)
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponse> {
    await this.userService.create(createUserDto);
    return ApiResponse.successResponse(
      'User has been created successfully',
      {},
      201,
    );
  }

  @Can(CategoriesEnum.users, ActionsEnum.listView)
  @Get()
  async findAll(@Paginate() query: PaginateQuery): Promise<ApiResponse> {
    const users = await this.userService.findAll(query);
    return ApiResponse.successResponse('users', { users }, 200);
  }

  @Can(CategoriesEnum.users, ActionsEnum.detailedView)
  @Get(':id')
  @ApiParam({ name: 'id', type: String, example: '1' })
  async findOne(@Param() params: BigIntIdParamDto) {
    const user = await this.userService.findOne(params.id);
    return ApiResponse.successResponse('user', { data: user }, 200);
  }

  @Can(CategoriesEnum.users, ActionsEnum.update)
  @Patch(':id')
  @ApiParam({ name: 'id', type: String, example: '1' })
  async update(
    @Param() params: BigIntIdParamDto,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.update(params.id, updateUserDto);

    return ApiResponse.successResponse(
      'User has been updated successfully',
      {},
    );
  }

  @Can(CategoriesEnum.users, ActionsEnum.delete)
  @Delete('/:id')
  @ApiParam({ name: 'id', type: String, example: '1' })
  async forceDelete(@Param() params: BigIntIdParamDto): Promise<ApiResponse> {
    await this.userService.forceDelete(params.id);
    return ApiResponse.successResponse(
      'User has been deleted successfully',
      {},
      200,
    );
  }
}
