import { createLateralJoinArrayFieldQueryInfo } from './types';

export const contributorQueryInfo = createLateralJoinArrayFieldQueryInfo({
  objectTable: 'risksmart.user_view_active',
  manyToManyTable: 'risksmart.contributor',
  objectTableJoinCol: 'Id',
  manyToManyJoinCol: 'UserId',
  objectTableQueryCol: 'FriendlyName',
  manyToManyPk: 'ParentId',
});
