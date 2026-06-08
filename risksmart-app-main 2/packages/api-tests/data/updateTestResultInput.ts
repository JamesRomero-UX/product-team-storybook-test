import { randomUUID } from 'crypto';

import { getDefaultUserId } from '../clients/defaults';
import type { UpdateTestResultInput } from '../generated/graphql';

const defaultUpdateTestResultInput: UpdateTestResultInput = {
  Description: 'Updated Description 1',
  Title: 'Updated Test result 1',
  TestType: 'businessLine',
  OverallEffectiveness: 2,
  TestDate: '2022-01-01', // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ParentControlId: null as any as string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Id: null as any as string,
};

export const buildUpdateTestResult = (
  overrides: Partial<UpdateTestResultInput> = {}
): UpdateTestResultInput => {
  return {
    ...defaultUpdateTestResultInput,
    Id: randomUUID(),
    Submitter: getDefaultUserId(),
    ...overrides,
  };
};
