import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { CurrentUser } from 'src/libs/decorators/current-user.decorator';
import { ApiResponse } from 'src/libs/errors/api-response';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { CreateClientAddressDto } from '../dto/request/create-client-address.dto';
import { ClientService } from '../services/client.service';
import { UpdateClientProfileDto } from '../dto/request/update-client-profile.dto';

@ApiTags('Client')
@ApiBearerAuth('JWT')
@Controller('client')
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
    private readonly i18n: I18nService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current client profile' })
  @ApiOkResponse({ description: 'Client profile retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Client not found' })
  async findProfile(@CurrentUser() user: ILoginUser): Promise<ApiResponse> {
    const clientId = user.client?.id;
    const data = await this.clientService.findProfile(clientId);

    return ApiResponse.successResponse(
      this.i18n.t('client.profile.get.success'),
      { data },
    );
  }

  @Post('address')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create client address' })
  @ApiOkResponse({ description: 'Client address created successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Client not found' })
  async createAddress(
    @Body() createClientAddressDto: CreateClientAddressDto,
    @CurrentUser() user: ILoginUser,
  ): Promise<ApiResponse> {
    await this.clientService.createAddress(createClientAddressDto, user);

    return ApiResponse.successResponse(
      this.i18n.t('client.address.create.success'),
    );
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update client profile' })
  @ApiOkResponse({ description: 'Client profile updated' })
  async updateProfile(
    @Body() updateClientProfileDto: UpdateClientProfileDto,
    @CurrentUser() user: ILoginUser,
  ) {
    await this.clientService.updateProfile(updateClientProfileDto, user);

    return ApiResponse.successResponse(
      this.i18n.t('client.profile.update.success'),
    );
  }
}
