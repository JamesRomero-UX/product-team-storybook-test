import { createLateralJoinArrayFieldQueryInfo } from './types';

export const contributorsUsersAndGroupsByFunctionInfo =
  createLateralJoinArrayFieldQueryInfo({
    tableFunctionName: 'risksmart.get_contributors_and_contributor_groups',
    functionQueryCol: 'Name',
    objectPk: 'Id',
  });
