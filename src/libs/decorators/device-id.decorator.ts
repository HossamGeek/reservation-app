import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractDeviceIdFromHeader } from 'src/modules/auth/utils/extract-device-id';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const DeviceId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return extractDeviceIdFromHeader(request);
  },
);
