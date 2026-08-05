import { Request } from 'express';
import { RequestMetaData } from 'src/modules/auth/dto/request/login-meta.dto';

export function getRequestMetaData(request: Request): RequestMetaData {
  const ip = request.ip || '';
  const userAgent = request.headers['user-agent'] || '';
  const metaData: RequestMetaData = {
    ipAddress: ip,
    userAgent: userAgent,
  };
  return metaData;
}
