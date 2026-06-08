import { createLateralJoinArrayFieldQueryInfo } from './types';

export const ownersQueryInfo = createLateralJoinArrayFieldQueryInfo({
  objectTable: 'risksmart.user_view_active',
  manyToManyTable: 'risksmart.owner',
  objectTableJoinCol: 'Id',
  manyToManyJoinCol: 'UserId',
  objectTableQueryCol: 'FriendlyName',
  manyToManyPk: 'ParentId',
});
