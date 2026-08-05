import { UnauthorizedException } from "@nestjs/common";

export function extractDeviceIdFromHeader(
  request: Request,
): string {
  const deviceId = request.headers['device-id'];

  if (!deviceId) {
    throw new UnauthorizedException('Device ID is required');
  }

  return deviceId;
}
