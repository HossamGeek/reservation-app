import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import { ILoginUser } from '../interfaces/user-request.interface';
import { REQUEST_USER_KEY } from '../constants/global-constants';

/**
 * @param ctx: the context
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const CurrentUser = createParamDecorator(
  (data: never, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const user: ILoginUser = request[REQUEST_USER_KEY];

    return user;
  },
);
