import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { insertAssessments } from '../clients/assessmentClient';
import {
  getObligationAssessmentResults,
  insertChildObligationAssessmentResult,
  insertObligationAssessmentResult,
} from '../clients/assessmentResultsClient';
import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import { insertObligation } from '../clients/obligationClient';
import { buildAssessment } from '../data/assessment';
import { buildObligationAssessmentResult } from '../data/assessmentResult';
import { buildObligation } from '../data/obligation';
import { buildOwner } from '../data/owner';
import { ParentTypeEnum } from '../generated/graphql';
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

describe('obligationAssessmentResult', () => {
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
      '$RoleKey should see $expectedRecords obligation assessment results where they are not the Owner or contributor of the assessment',
      async ({ expectedRecords, ...user }) => {
        const assessment = buildAssessment();
        await insertAssessments({
          objects: [assessment],
        });
        const obligation = buildObligation();
        await insertObligation(obligation);

        await insertObligationAssessmentResult(
          buildObligationAssessmentResult({
            parents: {
              data: [
                {
                  ParentId: assessment.Id,
                  ParentType: ParentTypeEnum.Assessment,
                  ResultType: ParentTypeEnum.Obligation,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
                {
                  ParentId: obligation.Id,
                  ParentType: ParentTypeEnum.Obligation,
                  ResultType: ParentTypeEnum.ObligationAssessmentResult,
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

        const assessments = await getObligationAssessmentResults(
          {
            ParentId: assessment.Id!,
          },
          {
            user,
          }
        );

        expect(assessments.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords obligation assessment results where they are the owner of the assessment',
      async ({ expectedRecords, ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const assessment = buildAssessment({
          owners: {
            data: [owner],
          },
        });
        await insertAssessments({
          objects: [assessment],
        });
        const obligation = buildObligation();
        await insertObligation(obligation);

        await insertObligationAssessmentResult(
          buildObligationAssessmentResult({
            parents: {
              data: [
                {
                  ParentId: assessment.Id,
                  ParentType: ParentTypeEnum.Assessment,
                  ResultType: ParentTypeEnum.Obligation,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
                {
                  ParentId: obligation.Id,
                  ParentType: ParentTypeEnum.Obligation,
                  ResultType: ParentTypeEnum.ObligationAssessmentResult,
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

        const assessments = await getObligationAssessmentResults(
          {
            ParentId: assessment.Id!,
          },
          {
            user,
          }
        );

        expect(assessments.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords obligation assessment results where they are the contributor of the assessment',
      async ({ expectedRecords, ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const assessment = buildAssessment({
          contributors: {
            data: [owner],
          },
        });
        await insertAssessments({
          objects: [assessment],
        });
        const obligation = buildObligation();
        await insertObligation(obligation);

        await insertObligationAssessmentResult(
          buildObligationAssessmentResult({
            parents: {
              data: [
                {
                  ParentId: assessment.Id,
                  ParentType: ParentTypeEnum.Assessment,
                  ResultType: ParentTypeEnum.Obligation,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
                {
                  ParentId: obligation.Id,
                  ParentType: ParentTypeEnum.Obligation,
                  ResultType: ParentTypeEnum.ObligationAssessmentResult,
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

        const assessments = await getObligationAssessmentResults(
          {
            ParentId: assessment.Id!,
          },
          {
            user,
          }
        );

        expect(assessments.length).toEqual(expectedRecords);
      }
    );
  });

  describe('insert', () => {
    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert obligation assessment results',
      async ({ ...user }) => {
        const assessment = buildAssessment();
        await insertAssessments({
          objects: [assessment],
        });
        const obligation = buildObligation();
        await insertObligation(obligation);

        const result = await insertChildObligationAssessmentResult(
          {
            ...buildObligationAssessmentResult({
              Id: undefined,
              parents: undefined,
              ModifiedByUser: undefined,
            }),
            AssessmentId: assessment.Id,
            ObligationIds: [obligation.Id as string],
          },
          {
            user,
          }
        );
        expect(
          result.data?.insertChildObligationAssessmentResult?.Ids
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
          "field 'insertChildObligationAssessmentResult' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should NOT insert obligation assessment results for non admin user when they are not an owner or contributor of the assessment',
      async ({ expected, ...user }) => {
        const assessment = buildAssessment();
        await insertAssessments({
          objects: [assessment],
        });
        const obligation = buildObligation();
        await insertObligation(obligation);

        await expect(
          insertChildObligationAssessmentResult(
            {
              ...buildObligationAssessmentResult({
                Id: undefined,
                parents: undefined,
                ModifiedByUser: undefined,
              }),
              AssessmentId: assessment.Id,
              ObligationIds: [obligation.Id as string],
            },
            {
              user,
            }
          )
        ).rejects.toThrow(expected);
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert obligation assessment results when user is an owner of the assessment',
      async ({ ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const assessment = buildAssessment({
          owners: {
            data: [owner],
          },
        });
        await insertAssessments({
          objects: [assessment],
        });
        const obligation = buildObligation();
        await insertObligation(obligation);

        const result = await insertChildObligationAssessmentResult(
          {
            ...buildObligationAssessmentResult({
              Id: undefined,
              parents: undefined,
              ModifiedByUser: undefined,
            }),
            AssessmentId: assessment.Id,
            ObligationIds: [obligation.Id as string],
          },
          {
            user,
          }
        );
        expect(
          result.data?.insertChildObligationAssessmentResult?.Ids
        ).toBeDefined();
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert obligation assessment results when user is an contributor of the assessment',
      async ({ ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const assessment = buildAssessment({
          contributors: {
            data: [owner],
          },
        });
        await insertAssessments({
          objects: [assessment],
        });
        const obligation = buildObligation();
        await insertObligation(obligation);

        const result = await insertChildObligationAssessmentResult(
          {
            ...buildObligationAssessmentResult({
              Id: undefined,
              parents: undefined,
              ModifiedByUser: undefined,
            }),
            AssessmentId: assessment.Id,
            ObligationIds: [obligation.Id as string],
          },
          {
            user,
          }
        );
        expect(
          result.data?.insertChildObligationAssessmentResult?.Ids
        ).toBeDefined();
      }
    );
  });
});
