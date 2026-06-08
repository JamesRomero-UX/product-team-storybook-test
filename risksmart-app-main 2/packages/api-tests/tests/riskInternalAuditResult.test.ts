import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import { insertInternalAuditReports } from '../clients/internalAuditReportClient';
import {
  getRiskControlledInternalAuditResults,
  insertChildRiskInternalAuditResult,
  insertRiskControlledInternalAuditResult,
} from '../clients/internalAuditResultsClient';
import { buildInternalAuditReport } from '../data/internalAuditReport';
import {
  buildRiskControlledInternalAuditResult,
  buildRiskUncontrolledInternalAuditResult,
} from '../data/internalAuditResult';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
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
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords risk internalAudit results where they are not the Owner or contributor of the internalAuditReport',
      async ({ expectedRecords, ...user }) => {
        const internalAudit = buildInternalAuditReport();
        await insertInternalAuditReports({
          objects: [internalAudit],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        await insertRiskControlledInternalAuditResult(
          buildRiskControlledInternalAuditResult({
            parents: {
              data: [
                {
                  ParentId: internalAudit.Id,
                  ParentType: ParentTypeEnum.InternalAuditReport,
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

        const internalAudits = await getRiskControlledInternalAuditResults(
          {
            ParentId: internalAudit.Id!,
          },
          {
            user,
          }
        );

        expect(internalAudits.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords risk internalAudit results where they are the owner of the internalAuditReport',
      async ({ expectedRecords, ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const internalAudit = buildInternalAuditReport({
          owners: {
            data: [owner],
          },
        });
        await insertInternalAuditReports({
          objects: [internalAudit],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        await insertRiskControlledInternalAuditResult(
          buildRiskControlledInternalAuditResult({
            parents: {
              data: [
                {
                  ParentId: internalAudit.Id,
                  ParentType: ParentTypeEnum.InternalAuditReport,
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

        const internalAudits = await getRiskControlledInternalAuditResults(
          {
            ParentId: internalAudit.Id!,
          },
          {
            user,
          }
        );

        expect(internalAudits.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords risk internalAudit results where they are the contributor of the internalAuditReport',
      async ({ expectedRecords, ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const internalAudit = buildInternalAuditReport({
          contributors: {
            data: [owner],
          },
        });
        await insertInternalAuditReports({
          objects: [internalAudit],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        await insertRiskControlledInternalAuditResult(
          buildRiskControlledInternalAuditResult({
            parents: {
              data: [
                {
                  ParentId: internalAudit.Id,
                  ParentType: ParentTypeEnum.InternalAuditReport,
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

        const internalAudits = await getRiskControlledInternalAuditResults(
          {
            ParentId: internalAudit.Id!,
          },
          {
            user,
          }
        );

        expect(internalAudits.length).toEqual(expectedRecords);
      }
    );
  });

  describe('insert', () => {
    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert risk internalAudit results',
      async ({ ...user }) => {
        const internalAudit = buildInternalAuditReport();
        await insertInternalAuditReports({
          objects: [internalAudit],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        const result = await insertChildRiskInternalAuditResult(
          {
            ...buildRiskControlledInternalAuditResult({
              Id: undefined,
              parents: undefined,
              ModifiedByUser: undefined,
            }),
            InternalAuditReportId: internalAudit.Id!,
            RiskIds: [risk.Id as string],
            ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
          },
          {
            user,
          }
        );
        expect(
          result.data?.insertChildRiskInternalAuditResult?.Ids
        ).toBeDefined();
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
          "field 'insertChildRiskInternalAuditResult' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should NOT insert risk internalAudit results for non admin user when they are not an owner or contributor of the internalAuditReport',
      async ({ expected, ...user }) => {
        const internalAudit = buildInternalAuditReport();
        await insertInternalAuditReports({
          objects: [internalAudit],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        await expect(
          insertChildRiskInternalAuditResult(
            {
              ...buildRiskControlledInternalAuditResult({
                Id: undefined,
                parents: undefined,
              }),
              InternalAuditReportId: internalAudit.Id!,
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
      '$RoleKey should insert risk controlled internalAudit results when user is an owner of the internalAuditReport',
      async ({ ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const internalAudit = buildInternalAuditReport({
          owners: {
            data: [owner],
          },
        });
        await insertInternalAuditReports({
          objects: [internalAudit],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        const result = await insertChildRiskInternalAuditResult(
          {
            ...buildRiskControlledInternalAuditResult({
              Id: undefined,
              parents: undefined,
              ModifiedByUser: undefined,
            }),
            InternalAuditReportId: internalAudit.Id!,
            RiskIds: [risk.Id as string],
            ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
          },
          {
            user,
          }
        );
        expect(
          result.data?.insertChildRiskInternalAuditResult?.Ids
        ).toBeDefined();
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert risk uncontrolled internalAudit results when user is an owner of the internalAuditReport',
      async ({ ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const internalAudit = buildInternalAuditReport({
          owners: {
            data: [owner],
          },
        });
        await insertInternalAuditReports({
          objects: [internalAudit],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        const result = await insertChildRiskInternalAuditResult(
          {
            ...buildRiskUncontrolledInternalAuditResult({
              Id: undefined,
              parents: undefined,
              ModifiedByUser: undefined,
            }),
            InternalAuditReportId: internalAudit.Id!,
            RiskIds: [risk.Id as string],
            ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
          },
          {
            user,
          }
        );
        expect(
          result.data?.insertChildRiskInternalAuditResult?.Ids
        ).toBeDefined();
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert risk internalAudit results when user is an contributor of the internalAuditReport',
      async ({ ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const internalAudit = buildInternalAuditReport({
          contributors: {
            data: [owner],
          },
        });
        await insertInternalAuditReports({
          objects: [internalAudit],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        const result = await insertChildRiskInternalAuditResult(
          {
            ...buildRiskControlledInternalAuditResult({
              Id: undefined,
              parents: undefined,
              ModifiedByUser: undefined,
            }),
            InternalAuditReportId: internalAudit.Id!,
            RiskIds: [risk.Id as string],
            ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
          },
          {
            user,
          }
        );
        expect(
          result.data?.insertChildRiskInternalAuditResult?.Ids
        ).toBeDefined();
      }
    );
  });
});
