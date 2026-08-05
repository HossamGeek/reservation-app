import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/libs/decorators/public.decorator';
import configs from 'src/libs/configs/configs';
import { IUserTokenPayload } from 'src/libs/interfaces/user-token-payload.interface';
import { REQUEST_USER_KEY } from 'src/libs/constants/global-constants';
import { I18nService } from 'nestjs-i18n';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private authService: AuthService,
    private readonly i18n: I18nService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (isPublic || request.url === '/') {
      return true;
    }

    if (!token) {
      throw new UnauthorizedException(this.i18n.t('auth.errors.tokenRequired'));
    }

    try {
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      const tokenPayload: IUserTokenPayload = await this.jwtService.verifyAsync(
        token,
        {
          secret: configs.JWT_SECRET,
        },
      );

      request[REQUEST_USER_KEY] =
        await this.authService.validateUser(tokenPayload);

      // validate the token slug
      await this.authService.validateTokenSlug(request[REQUEST_USER_KEY]);
    } catch (err) {
      Logger.error(
        `Invalid token: ${err instanceof Error ? err.message : String(err)}`,
      );

      throw new UnauthorizedException(this.i18n.t('auth.errors.invalidToken'));
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
