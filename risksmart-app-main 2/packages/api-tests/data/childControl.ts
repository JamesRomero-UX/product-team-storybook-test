import type {
  InsertChildControlInput,
  UpdateChildControlInput,
} from '../generated/graphql';
import { buildScheduleInput } from './schedule';

const defaultInsertChildControl: InsertChildControlInput = {
  Description: 'Description 1',
  Title: 'Control 1',
  Type: 'Preventive',
  ParentId: '',
  DepartmentTypeIds: [],
  TagTypeIds: [],
  OwnerGroupIds: [],
  ContributorGroupIds: [],
  OwnerUserIds: [],
  ContributorUserIds: [],
  schedule: buildScheduleInput(),
};

export const buildInsertChildControl = (
  overrides: Partial<InsertChildControlInput> = {}
): InsertChildControlInput => {
  return {
    ...defaultInsertChildControl,
    ...overrides,
  };
};

const defaultUpdateChildControl: UpdateChildControlInput = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Id: null as any as string,
  OriginalTimestamp: '',
  Description: 'Description 1',
  Title: 'Control 1',
  Type: 'Preventive',
  DepartmentTypeIds: [],
  TagTypeIds: [],
  OwnerGroupIds: [],
  ContributorGroupIds: [],
  OwnerUserIds: [],
  ContributorUserIds: [],
  schedule: buildScheduleInput(),
};

export const buildUpdateChildControl = (
  overrides: Partial<UpdateChildControlInput> = {}
): UpdateChildControlInput => {
  return {
    ...defaultUpdateChildControl,
    ...overrides,
  };
};
