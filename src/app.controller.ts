import { Controller, Get } from '@nestjs/common';
import { Public } from './libs/decorators/public.decorator';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check - API status' })
  @ApiOkResponse({
    description: 'API is running successfully',
    schema: {
      example: {
        message: 'Jokers API is running!',
      },
    },
  })
  index() {
    return {
      message: 'Jokers API is running!',
    };
  }
}
