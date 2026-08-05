import {
  ActionsEnum,
  CategoriesEnum,
  Permissions,
} from 'src/libs/enums/permission.enum';
import { systemPermission } from 'src/libs/constants/system-permissions';
import { FrontendPermission } from 'src/modules/role/dto/request/create-role.dto';

export const convertToObjectShape = (obj: FrontendPermission) => {
  const permission: Permissions = Object.keys(systemPermission).reduce(
    (acc, categoryValue) => {
      const categoryKey = Object.keys(CategoriesEnum).find(
        (key) => CategoriesEnum[key] === categoryValue,
      );

      if (!categoryKey) {
        return acc;
      }

      const category = CategoriesEnum[categoryKey];

      acc[category] = {};
      Object.keys(systemPermission[category]).forEach((actionKey) => {
        const action = ActionsEnum[actionKey as keyof typeof ActionsEnum];

        // Only assign if action exists in ActionsEnum
        if (action !== undefined) {
          acc[category][action] = false;
        }
      });
      return acc;
    },
    {} as Permissions,
  );

  for (const category in obj) {
    for (const action of obj[category]) {
      permission[category][action] = true;
      permission[category][ActionsEnum.listView] = true;
    }
  }

  return permission;
};

export const convertToFrontendPermission = (
  obj: Permissions,
): FrontendPermission => {
  const frontendPermission: FrontendPermission = {} as FrontendPermission;

  for (const category in obj) {
    frontendPermission[category] = [];

    for (const action in obj[category]) {
      if (obj[category][action]) {
        frontendPermission[category].push(action as ActionsEnum);
      }
    }
  }

  return frontendPermission;
};
