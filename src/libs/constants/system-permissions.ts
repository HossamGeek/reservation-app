import {
  ActionsEnum,
  CategoriesEnum,
  DependenciesPermission,
  Permissions,
} from '../enums/permission.enum';

const defaultActions = {
  [ActionsEnum.listView]: [],
  [ActionsEnum.detailedView]: [],
  [ActionsEnum.create]: [],
  [ActionsEnum.update]: [],
  [ActionsEnum.restore]: [],
  [ActionsEnum.delete]: [],
};

export const getDependenciesString = (cat: CategoriesEnum, act: ActionsEnum) =>
  `${cat}.${act}`;

export const PERMISSION_INCLUDES_DEPENDENCIES: DependenciesPermission = {
  [CategoriesEnum.roles]: {
    ...defaultActions,
  },
  [CategoriesEnum.users]: {
    ...defaultActions,
  },
  [CategoriesEnum.countries]: {
    [ActionsEnum.listView]: [],
    [ActionsEnum.update]: [],
  },
  [CategoriesEnum.cities]: {
    [ActionsEnum.create]: [],
    [ActionsEnum.listView]: [],
    [ActionsEnum.detailedView]: [],
    [ActionsEnum.update]: [],
  },
  [CategoriesEnum.nationalities]: {
    [ActionsEnum.create]: [],
    [ActionsEnum.listView]: [],
    [ActionsEnum.update]: [],
  },
  [CategoriesEnum.providers]: {
    ...defaultActions,
    [ActionsEnum.review]: [],
  },
  [CategoriesEnum.positions]: {
    [ActionsEnum.create]: [],
    [ActionsEnum.listView]: [],
    [ActionsEnum.update]: [],
  },
  [CategoriesEnum.religions]: {
    [ActionsEnum.create]: [],
    [ActionsEnum.listView]: [],
    [ActionsEnum.update]: [],
  },
  [CategoriesEnum.experiences]: {
    [ActionsEnum.create]: [],
    [ActionsEnum.listView]: [],
    [ActionsEnum.update]: [],
  },
  [CategoriesEnum.skills]: {
    [ActionsEnum.listView]: [],
    [ActionsEnum.create]: [],
    [ActionsEnum.update]: [],
  },
  [CategoriesEnum.languages]: {
    [ActionsEnum.listView]: [],
    [ActionsEnum.create]: [],
    [ActionsEnum.update]: [],
  },
  [CategoriesEnum.documents]: {
    [ActionsEnum.detailedView]: [],
    [ActionsEnum.update]: [],
  },
  [CategoriesEnum.categories]: {
    [ActionsEnum.listView]: [],
    [ActionsEnum.create]: [],
    [ActionsEnum.update]: [],
    [ActionsEnum.delete]: [],
  },
  [CategoriesEnum.services]: {
    [ActionsEnum.create]: [],
    [ActionsEnum.listView]: [],
    [ActionsEnum.detailedView]: [],
  },
  [CategoriesEnum.serviceTypes]: {
    [ActionsEnum.listView]: [],
    [ActionsEnum.update]: [],
  },
  [CategoriesEnum.serviceTypeOptions]: {
    [ActionsEnum.create]: [],
    [ActionsEnum.update]: [],
  },
  [CategoriesEnum.shifts]: {
    [ActionsEnum.create]: [],
    [ActionsEnum.listView]: [],
    [ActionsEnum.detailedView]: [],
    [ActionsEnum.update]: [],
  },
  [CategoriesEnum.branches]: {
    [ActionsEnum.create]: [],
    [ActionsEnum.listView]: [],
    [ActionsEnum.detailedView]: [],
    [ActionsEnum.update]: [],
  },
};

export const systemPermission: Permissions = Object.keys(
  PERMISSION_INCLUDES_DEPENDENCIES,
).reduce((result, category) => {
  result[category as CategoriesEnum] = Object.keys(
    PERMISSION_INCLUDES_DEPENDENCIES[category as CategoriesEnum],
  ).reduce(
    (actionResult, action) => {
      actionResult[action as ActionsEnum] = false;
      return actionResult;
    },
    {} as { [key in ActionsEnum]: boolean },
  );
  return result;
}, {} as Permissions);
