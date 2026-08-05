/* eslint-disable @typescript-eslint/naming-convention */
import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';

// Define metadata keys
export const ENTITY_TYPE_KEY = 'entityType';
export const ACTION_KEY = 'action';

// Define the decorator factory function
export const EntityGuard = (...entityType: CategoriesEnum[]) =>
  SetMetadata(ENTITY_TYPE_KEY, entityType);

// Define the decorator factory function
export const ActionGuard = (...action: ActionsEnum[]) =>
  SetMetadata(ACTION_KEY, action);

export const Can = (entityType: CategoriesEnum, action: ActionsEnum) => {
  return applyDecorators(EntityGuard(entityType), ActionGuard(action));
};
