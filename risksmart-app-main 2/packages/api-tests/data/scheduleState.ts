import { getDefaultOrgId } from '../clients/defaults';
import type { ScheduleStateInsertInput } from '../generated/graphql';

export const defaultScheduleInput: ScheduleStateInsertInput = {};

export const buildScheduleStateInsertInput = (
  overrides: Partial<ScheduleStateInsertInput> = {}
): ScheduleStateInsertInput => {
  return {
    ...defaultScheduleInput,
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
