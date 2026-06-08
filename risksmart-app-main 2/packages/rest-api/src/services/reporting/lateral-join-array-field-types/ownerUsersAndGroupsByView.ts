import { createLateralJoinArrayFieldQueryInfo } from './types';

export const ownerUsersAndGroupsViewInfo = createLateralJoinArrayFieldQueryInfo(
  {
    objectTable: 'risksmart.owner_and_owner_group_view',
    objectTableQueryCol: 'FriendlyName',
    objectPk: 'Id',
  }
);
