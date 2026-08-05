/* eslint-disable @typescript-eslint/no-explicit-any */

import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';

export class CreateLogRecordDto {
  actionableEntity: CategoriesEnum;
  action: ActionsEnum;
  slug: string;
  ip: string;
  userId: string;
  authorized: boolean;
  actionableId: string;
  params: any;
  body: any;
}
