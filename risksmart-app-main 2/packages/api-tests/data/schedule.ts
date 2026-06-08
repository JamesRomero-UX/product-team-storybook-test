import { getDefaultOrgId } from '../clients/defaults';
import type { ScheduleInput } from '../generated/graphql';
import { TestFrequencyEnum, UnitOfTimeEnum } from '../generated/graphql';
import type { ScheduleInsertInput } from '../generated/graphql2';

const defaultScheduleInput: ScheduleInput = {
  StartDate: null,
  Frequency: TestFrequencyEnum.Adhoc,
  TimeToCompleteUnit: UnitOfTimeEnum.Day,
  ManualDueDate: null,
};

export const buildScheduleInput = (
  overrides: Partial<ScheduleInput> = {}
): ScheduleInput => {
  return {
    ...defaultScheduleInput,
    ...overrides,
  };
};

export const buildScheduleInsertInput = (
  overrides: Partial<ScheduleInsertInput> = {}
): ScheduleInsertInput => {
  return {
    ...defaultScheduleInput,
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
