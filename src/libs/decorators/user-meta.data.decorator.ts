import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { getRequestMetaData } from '../utils/get-request-meta-data';
import { RequestMetaData } from 'src/modules/auth/dto/request/login-meta.dto';

export const USER_META = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestMetaData => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return getRequestMetaData(request);
  },
);
