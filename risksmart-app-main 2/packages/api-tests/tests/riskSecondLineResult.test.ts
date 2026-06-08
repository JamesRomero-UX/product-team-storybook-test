import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertComplianceMonitoringAssessments } from '../clients/complianceMonitoringAssessmentClient';
import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import {
  getRiskControlledSecondLineResults,
  insertChildRiskSecondLineResult,
  insertRiskControlledSecondLineResult,
} from '../clients/secondLineResultsClient';
import { buildComplianceMonitoringAssessment } from '../data/complianceMonitoringAssessment';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
import {
  buildRiskControlledSecondLineResult,
  buildRiskUncontrolledSecondLineResult,
} from '../data/secondLineResult';
import {
  ParentTypeEnum,
  RiskAssessmentResultControlTypeEnum,
} from '../generated/graphql';
import {
  internalAuditUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
  standardEnhancedUser1,
  standardUser1,
  teardown,
} from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('riskInternalAuditResult', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords risk secondLine results where they are not the Owner or contributor of the secondLineReport',
      async ({ expectedRecords, ...user }) => {
        const secondLine = buildComplianceMonitoringAssessment();
        await insertComplianceMonitoringAssessments({
          objects: [secondLine],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        await insertRiskControlledSecondLineResult(
          buildRiskControlledSecondLineResult({
            parents: {
              data: [
                {
                  ParentId: secondLine.Id,
                  ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
                  ResultType: ParentTypeEnum.Document,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
                {
                  ParentId: risk.Id,
                  ParentType: ParentTypeEnum.Risk,
                  ResultType: ParentTypeEnum.RiskAssessmentResult,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
              ],
            },
          })
        );

        const secondLines = await getRiskControlledSecondLineResults(
          {
            ParentId: secondLine.Id!,
          },
          {
            user,
          }
        );

        expect(secondLines.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords risk secondLine results where they are the owner of the secondLineReport',
      async ({ expectedRecords, ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const secondLine = buildComplianceMonitoringAssessment({
          owners: {
            data: [owner],
          },
        });
        await insertComplianceMonitoringAssessments({
          objects: [secondLine],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        await insertRiskControlledSecondLineResult(
          buildRiskControlledSecondLineResult({
            parents: {
              data: [
                {
                  ParentId: secondLine.Id,
                  ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
                  ResultType: ParentTypeEnum.Document,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
                {
                  ParentId: risk.Id,
                  ParentType: ParentTypeEnum.Risk,
                  ResultType: ParentTypeEnum.RiskAssessmentResult,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
              ],
            },
          })
        );

        const secondLines = await getRiskControlledSecondLineResults(
          {
            ParentId: secondLine.Id!,
          },
          {
            user,
          }
        );

        expect(secondLines.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords risk secondLine results where they are the contributor of the secondLineReport',
      async ({ expectedRecords, ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const secondLine = buildComplianceMonitoringAssessment({
          contributors: {
            data: [owner],
          },
        });
        await insertComplianceMonitoringAssessments({
          objects: [secondLine],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        await insertRiskControlledSecondLineResult(
          buildRiskControlledSecondLineResult({
            parents: {
              data: [
                {
                  ParentId: secondLine.Id,
                  ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
                  ResultType: ParentTypeEnum.Document,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
                {
                  ParentId: risk.Id,
                  ParentType: ParentTypeEnum.Risk,
                  ResultType: ParentTypeEnum.RiskAssessmentResult,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
              ],
            },
          })
        );

        const secondLines = await getRiskControlledSecondLineResults(
          {
            ParentId: secondLine.Id!,
          },
          {
            user,
          }
        );

        expect(secondLines.length).toEqual(expectedRecords);
      }
    );
  });

  describe('insert', () => {
    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert risk secondLine results',
      async ({ ...user }) => {
        const secondLine = buildComplianceMonitoringAssessment();
        await insertComplianceMonitoringAssessments({
          objects: [secondLine],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        const result = await insertChildRiskSecondLineResult(
          {
            ...buildRiskControlledSecondLineResult({
              Id: undefined,
              parents: undefined,
              ModifiedByUser: undefined,
            }),
            ComplianceMonitoringAssessmentId: secondLine.Id!,
            RiskIds: [risk.Id as string],
            ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
          },
          {
            user,
          }
        );
        expect(result.data?.insertChildRiskSecondLineResult?.Ids).toBeDefined();
      }
    );

    it.each([
      {
        ...standardUser1,
        expected: 'Access denied',
      },
      {
        ...standardEnhancedUser1,
        expected: 'Access denied',
      },
      {
        ...internalAuditUser1,
        expected: 'Access denied',
      },
      {
        ...readOnlyUser1,
        expected:
          "field 'insertChildRiskSecondLineResult' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should NOT insert risk secondLine results for non admin user when they are not an owner or contributor of the secondLineReport',
      async ({ expected, ...user }) => {
        const secondLine = buildComplianceMonitoringAssessment();
        await insertComplianceMonitoringAssessments({
          objects: [secondLine],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        await expect(
          insertChildRiskSecondLineResult(
            {
              ...buildRiskControlledSecondLineResult({
                Id: undefined,
                parents: undefined,
              }),
              ComplianceMonitoringAssessmentId: secondLine.Id!,
              RiskIds: [risk.Id as string],
              ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
            },
            {
              user,
            }
          )
        ).rejects.toThrow(expected);
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert risk controlled secondLine results when user is an owner of the secondLineReport',
      async ({ ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const secondLine = buildComplianceMonitoringAssessment({
          owners: {
            data: [owner],
          },
        });
        await insertComplianceMonitoringAssessments({
          objects: [secondLine],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        const result = await insertChildRiskSecondLineResult(
          {
            ...buildRiskControlledSecondLineResult({
              Id: undefined,
              parents: undefined,
              ModifiedByUser: undefined,
            }),
            ComplianceMonitoringAssessmentId: secondLine.Id!,
            RiskIds: [risk.Id as string],
            ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
          },
          {
            user,
          }
        );
        expect(result.data?.insertChildRiskSecondLineResult?.Ids).toBeDefined();
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert risk uncontrolled secondLine results when user is an owner of the secondLineReport',
      async ({ ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const secondLine = buildComplianceMonitoringAssessment({
          owners: {
            data: [owner],
          },
        });
        await insertComplianceMonitoringAssessments({
          objects: [secondLine],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        const result = await insertChildRiskSecondLineResult(
          {
            ...buildRiskUncontrolledSecondLineResult({
              Id: undefined,
              parents: undefined,
              ModifiedByUser: undefined,
            }),
            ComplianceMonitoringAssessmentId: secondLine.Id!,
            RiskIds: [risk.Id as string],
            ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
          },
          {
            user,
          }
        );
        expect(result.data?.insertChildRiskSecondLineResult?.Ids).toBeDefined();
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert risk secondLine results when user is an contributor of the secondLineReport',
      async ({ ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const secondLine = buildComplianceMonitoringAssessment({
          contributors: {
            data: [owner],
          },
        });
        await insertComplianceMonitoringAssessments({
          objects: [secondLine],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        const result = await insertChildRiskSecondLineResult(
          {
            ...buildRiskControlledSecondLineResult({
              Id: undefined,
              parents: undefined,
              ModifiedByUser: undefined,
            }),
            ComplianceMonitoringAssessmentId: secondLine.Id!,
            RiskIds: [risk.Id as string],
            ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
          },
          {
            user,
          }
        );
        expect(result.data?.insertChildRiskSecondLineResult?.Ids).toBeDefined();
      }
    );
  });
});
