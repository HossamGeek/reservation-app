import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common/exceptions/forbidden.exception';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import {
  ACTION_KEY,
  ENTITY_TYPE_KEY,
} from 'src/libs/decorators/entity-action.decorator';
import { IS_PUBLIC_KEY } from 'src/libs/decorators/public.decorator';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { REQUEST_USER_KEY } from 'src/libs/constants/global-constants';
import { I18nService } from 'nestjs-i18n';
import { LoggingService } from '../logging.service';
import { CreateLogRecordDto } from '../dto/request/create-log-record.dto';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly loggingService: LoggingService,
    private readonly i18n: I18nService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const isPublic = this.reflector.get<CategoriesEnum>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    const entityType = this.reflector.get<CategoriesEnum>(
      ENTITY_TYPE_KEY,
      context.getHandler(),
    );

    const action = this.reflector.get<ActionsEnum>(
      ACTION_KEY,
      context.getHandler(),
    );

    if (!entityType || !action) {
      return true;
    }

    const user = request[REQUEST_USER_KEY] as ILoginUser;

    const permissions = user.role?.permissions ?? null;

    const hasPermissionForAll = !!(
      permissions != null &&
      permissions[entityType] &&
      permissions[entityType][action]
    );

    const body = request.body;
    const params = request.params;

    const logRecord: CreateLogRecordDto = {
      actionableEntity: entityType,
      action,
      slug: user.slug || 'no-slug',
      ip: request.ip || 'no-ip',
      userId: user.id,
      authorized: hasPermissionForAll,
      body: body,
      params: params,
      actionableId: params.id || '',
    };

    void this.loggingService.addLog(logRecord);

    if (hasPermissionForAll) {
      return true;
    }

    throw new ForbiddenException(this.i18n.t('auth.errors.notAuthorized'));
  }
}
