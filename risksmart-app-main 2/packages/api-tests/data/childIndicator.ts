import type {
  InsertChildIndicatorInput,
  UpdateChildIndicatorInput,
} from '../generated/graphql';
import { IndicatorTypeEnum } from '../generated/graphql';
import { buildScheduleInput } from './schedule';

const defaultChildIndicatorInsert: InsertChildIndicatorInput = {
  Description: 'Indicator description',
  Title: 'Indicator Title',
  TargetValueTxt: '1',
  Unit: null,
  Type: IndicatorTypeEnum.Text,
  DepartmentTypeIds: [],
  TagTypeIds: [],
  ParentId: '',
  OwnerGroupIds: [],
  ContributorGroupIds: [],
  OwnerUserIds: [],
  ContributorUserIds: [],
  schedule: buildScheduleInput(),
};

export const buildChildIndicatorInsert = (
  overrides: Partial<InsertChildIndicatorInput> = {}
): InsertChildIndicatorInput => {
  return {
    ...defaultChildIndicatorInsert,
    ...overrides,
  };
};

const defaultChildIndicatorUpdate: UpdateChildIndicatorInput = {
  Description: 'Indicator description',
  Title: 'Indicator Title',
  TargetValueTxt: '1',
  Unit: null,
  Type: IndicatorTypeEnum.Text,
  DepartmentTypeIds: [],
  TagTypeIds: [],
  Id: '',
  OwnerGroupIds: [],
  ContributorGroupIds: [],
  OwnerUserIds: [],
  ContributorUserIds: [],
  schedule: buildScheduleInput(),
};

export const buildChildIndicatorUpdate = (
  overrides: Partial<UpdateChildIndicatorInput> = {}
): UpdateChildIndicatorInput => {
  return {
    ...defaultChildIndicatorUpdate,
    ...overrides,
  };
};
