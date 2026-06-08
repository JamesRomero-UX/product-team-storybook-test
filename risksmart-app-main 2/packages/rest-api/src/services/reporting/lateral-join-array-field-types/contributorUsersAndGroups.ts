import { createLateralJoinArrayFieldQueryInfo } from './types';

export const contributorUsersAndGroupsInfo =
  createLateralJoinArrayFieldQueryInfo({
    objectTable: 'risksmart.contributor_and_contributor_group_view',
    objectPk: 'Id',
    objectTableQueryCol: 'FriendlyName',
  });
