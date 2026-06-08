import { contributorsUsersAndGroupsByFunctionInfo } from './contributersUsersAndGroupsByFunction';
import { contributorQueryInfo } from './contributors';
import { departmentsQueryInfo } from './departments';
import { ownersQueryInfo } from './owners';
import { ownerUsersAndGroupsFunctionInfo } from './ownerUsersAndGroupsByFunction';
import { tagsQueryInfo } from './tags';

export const inlineArrayJoinFieldsTypes = {
  contributors: contributorQueryInfo,
  owners: ownersQueryInfo,
  departments: departmentsQueryInfo,
  tags: tagsQueryInfo,
  ownerUsersAndGroups: ownerUsersAndGroupsFunctionInfo,
  contributorUsersAndGroups: contributorsUsersAndGroupsByFunctionInfo,
};

export type InlineArrayJoinArrayFieldTypes =
  keyof typeof inlineArrayJoinFieldsTypes;
