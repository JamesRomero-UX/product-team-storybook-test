import { createLateralJoinArrayFieldQueryInfo } from './types';

export const ownerUsersAndGroupsFunctionInfo =
  createLateralJoinArrayFieldQueryInfo({
    tableFunctionName: 'risksmart.get_owners_and_owner_groups',
    functionQueryCol: 'Name',
    objectPk: 'Id',
  });
