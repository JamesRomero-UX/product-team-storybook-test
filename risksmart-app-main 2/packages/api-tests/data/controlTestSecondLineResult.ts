import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  ControlTestSecondLineResultInsertInput,
  InsertControlTestSecondLineResultMutationVariables,
} from '../generated/graphql';

const defaultTestResult: ControlTestSecondLineResultInsertInput = {
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
  overrides: Partial<ControlTestSecondLineResultInsertInput> = {}
): ControlTestSecondLineResultInsertInput => {
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

const defaultControlTestResult: InsertControlTestSecondLineResultMutationVariables =
  {
    ControlIds: [],
    Description: 'Description 1',
    Title: 'Test result 1',
    TestType: 'businessLine',
    OverallEffectiveness: 2,
    DesignEffectiveness: 1,
    PerformanceEffectiveness: 3,
    TestDate: '2021-01-01',
    ComplianceMonitoringAssessmentId: '',
  };

export const buildControlTestResult = (
  overrides: Partial<InsertControlTestSecondLineResultMutationVariables> = {}
): InsertControlTestSecondLineResultMutationVariables => {
  return {
    ...defaultControlTestResult,
    Submitter: getDefaultUserId(),
    ...overrides,
  };
};
