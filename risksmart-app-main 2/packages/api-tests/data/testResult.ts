import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  InsertControlTestResultMutationVariables,
  TestResultInsertInput,
} from '../generated/graphql';

const defaultTestResult: TestResultInsertInput = {
  Description: 'Description 1',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Id: null as any as string,
  Meta: undefined,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
  Title: 'Test result 1',
  TestType: 'businessLine',
  OverallEffectiveness: 2,
  TestDate: '2021-01-01',
};

export const buildTestResult = (
  overrides: Partial<TestResultInsertInput> = {}
): TestResultInsertInput => {
  return {
    ...defaultTestResult,
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    Submitter: getDefaultUserId(),
    ...overrides,
  };
};

const defaultControlTestResult: InsertControlTestResultMutationVariables = {
  ControlIds: [],
  Description: 'Description 1',
  Title: 'Test result 1',
  TestType: 'businessLine',
  OverallEffectiveness: 2,
  DesignEffectiveness: 1,
  PerformanceEffectiveness: 3,
  TestDate: '2021-01-01',
};

export const buildControlTestResult = (
  overrides: Partial<InsertControlTestResultMutationVariables> = {}
): InsertControlTestResultMutationVariables => {
  return {
    ...defaultControlTestResult,
    Submitter: getDefaultUserId(),
    ...overrides,
  };
};
