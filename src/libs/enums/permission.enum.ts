export enum CategoriesEnum {
  roles = 'roles',
  users = 'users',
  countries = 'countries',
  cities = 'cities',
  nationalities = 'nationalities',
  providers = 'providers',
  positions = 'positions',
  skills = 'skills',
  languages = 'languages',
  religions = 'religions',
  experiences = 'experiences',
  documents = 'documents',
  categories = 'categories',
  services = 'services',
  serviceTypes = 'serviceTypes',
  serviceTypeOptions = 'serviceTypeOptions',
  shifts = 'shifts',
  branches = 'branches',
}

export enum ActionsEnum {
  listView = 'listView', // used to get all elements of some type without details
  detailedView = 'detailedView', // used for getting one element with details
  create = 'create',
  update = 'update',
  restore = 'restore',
  delete = 'delete',
  review = 'review',
}

export type Permissions = {
  [entity in CategoriesEnum]: Partial<{
    [action in ActionsEnum]: boolean;
  }>;
};

export type DependenciesPermission = {
  [entity in CategoriesEnum]: Partial<{
    [action in ActionsEnum]: string[];
  }>;
};

export type FullFrontEndPermission = {
  [entity in CategoriesEnum]: Partial<{
    [action in ActionsEnum]: {
      dependencies: string[];
      dependent: string[];
    };
  }>;
};

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
    [ActionsEnum.delete]: [],
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
