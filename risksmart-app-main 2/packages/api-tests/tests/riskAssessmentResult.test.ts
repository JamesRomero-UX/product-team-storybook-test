import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertAssessments } from '../clients/assessmentClient';
import {
  getRiskAssessmentResults,
  insertChildRiskAssessmentResult,
  insertRiskAssessmentResult,
  updateChildRiskAssessmentResult,
  updateRiskAssessmentResult,
} from '../clients/assessmentResultsClient';
import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import { insertRiskAssessmentResultConfig } from '../clients/riskAssessmentResultConfigClient';
import { buildAssessment } from '../data/assessment';
import { buildRiskAssessmentResult } from '../data/assessmentResult';
import { buildAssessmentResultParent } from '../data/assessmentResultParent';
import { buildContributor } from '../data/contributor';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
import { buildRiskAssessmentResultConfig } from '../data/riskAssessmentResultConfig';
import { buildUpdateChildRiskAssessmentResult } from '../data/updateChildRiskAssessmentResult';
import type {
  AssessmentInsertInput,
  RiskAssessmentResultInsertInput,
  RiskInsertInput,
} from '../generated/graphql';
import { ParentTypeEnum } from '../generated/graphql';
import {
  customerSupportUser1,
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

describe('riskAssessmentResult', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('getRiskAssessmentResults', () => {
    it.each([
      { ...customerSupportUser1, expectedRecords: 1 },
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords risk assessment results where they are NOT an owner or contributor of the assessment',
      async ({ expectedRecords, ...user }) => {
        const assessment = buildAssessment();
        await insertAssessments({
          objects: [assessment],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        await insertRiskAssessmentResult(
          buildRiskAssessmentResult({
            parents: {
              data: [
                {
                  ParentId: assessment.Id,
                  ParentType: ParentTypeEnum.Assessment,
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

        const assessments = await getRiskAssessmentResults(
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
      { ...customerSupportUser1, expectedRecords: 1 },
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords risk assessment results where they are an owner of the assessment',
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
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        await insertRiskAssessmentResult(
          buildRiskAssessmentResult({
            parents: {
              data: [
                {
                  ParentId: assessment.Id,
                  ParentType: ParentTypeEnum.Assessment,
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

        const assessments = await getRiskAssessmentResults(
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
      { ...customerSupportUser1, expectedRecords: 1 },
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords risk assessment results when they are a contributor of the assessment',
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
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        await insertRiskAssessmentResult(
          buildRiskAssessmentResult({
            parents: {
              data: [
                {
                  ParentId: assessment.Id,
                  ParentType: ParentTypeEnum.Assessment,
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

        const assessments = await getRiskAssessmentResults(
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

  describe('insertChildRiskAssessmentResult', () => {
    it.each([{ ...customerSupportUser1 }, { ...riskManagerUser1 }])(
      '$RoleKey should insert risk assessment results',
      async ({ ...user }) => {
        const assessment = buildAssessment();
        await insertAssessments({
          objects: [assessment],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        const result = await insertChildRiskAssessmentResult(
          {
            ...buildRiskAssessmentResult({
              Id: undefined,
              parents: undefined,
              ModifiedByUser: undefined,
            }),
            AssessmentId: assessment.Id,
            RiskIds: [risk.Id as string],
          },
          {
            user,
          }
        );
        expect(result.data?.insertChildRiskAssessmentResult?.Ids).toBeDefined();
      }
    );

    it('should set ConfigId to null when no config exists', async () => {
      const assessment = buildAssessment();
      await insertAssessments({
        objects: [assessment],
      });
      const risk = buildRisk();
      await apiClient.insertRisk({ objects: risk });

      await insertChildRiskAssessmentResult(
        {
          ...buildRiskAssessmentResult({
            Id: undefined,
            parents: undefined,
            ModifiedByUser: undefined,
          }),
          AssessmentId: assessment.Id,
          RiskIds: [risk.Id as string],
        },
        {
          user: riskManagerUser1,
        }
      );

      const assessmentResults = await getRiskAssessmentResults(
        { ParentId: assessment.Id! },
        { user: riskManagerUser1 }
      );

      expect(assessmentResults).toHaveLength(1);
      expect(assessmentResults[0].ConfigId).toBeNull();
    });

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
          "field 'insertChildRiskAssessmentResult' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should NOT insert risk assessment results when they are NOT an owner or contributor of the risk',
      async ({ expected, ...user }) => {
        const assessment = buildAssessment();
        await insertAssessments({
          objects: [assessment],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        await expect(
          insertChildRiskAssessmentResult(
            {
              ...buildRiskAssessmentResult({
                Id: undefined,
                parents: undefined,
              }),
              AssessmentId: assessment.Id,
              RiskIds: [risk.Id as string],
            },
            {
              user,
            }
          )
        ).rejects.toThrow(expected);
      }
    );

    it.each([
      { ...customerSupportUser1 },
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
    ])(
      '$RoleKey should insert risk assessment results when they are an owner of the risk',
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
        const risk = buildRisk({
          owners: {
            data: [owner],
          },
        });

        await apiClient.insertRisk({ objects: risk });

        const result = await insertChildRiskAssessmentResult(
          {
            ...buildRiskAssessmentResult({
              Id: undefined,
              parents: undefined,
              ModifiedByUser: undefined,
            }),
            AssessmentId: assessment.Id,
            RiskIds: [risk.Id as string],
          },
          {
            user,
          }
        );
        expect(result.data?.insertChildRiskAssessmentResult?.Ids).toBeDefined();
      }
    );

    it.each([
      { ...customerSupportUser1 },
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
    ])(
      '$RoleKey should insert risk assessment results when they are a contributor of the risk',
      async ({ ...user }) => {
        const assessment = buildAssessment({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertAssessments({
          objects: [assessment],
        });

        const risk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const result = await insertChildRiskAssessmentResult(
          {
            ...buildRiskAssessmentResult({
              Id: undefined,
              parents: undefined,
              ModifiedByUser: undefined,
            }),
            AssessmentId: assessment.Id,
            RiskIds: [risk.Id as string],
          },
          {
            user,
          }
        );
        expect(result.data?.insertChildRiskAssessmentResult?.Ids).toBeDefined();
      }
    );

    describe('with multiple impacts', () => {
      let insertResult: Awaited<
        ReturnType<typeof insertChildRiskAssessmentResult>
      >;
      let assessmentResults: Awaited<
        ReturnType<typeof getRiskAssessmentResults>
      >;

      beforeEach(async () => {
        await insertRiskAssessmentResultConfig(
          { Config: buildRiskAssessmentResultConfig() },
          { user: riskManagerUser1, orgId: getDefaultOrgId() }
        );

        const assessment = buildAssessment();
        await insertAssessments({
          objects: [assessment],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        insertResult = await insertChildRiskAssessmentResult(
          {
            ...buildRiskAssessmentResult({
              Id: undefined,
              parents: undefined,
              ModifiedByUser: undefined,
              Impact: undefined,
            }),
            AssessmentId: assessment.Id,
            RiskIds: [risk.Id as string],
            Impacts: [
              { Label: 'Financial', Value: 2 },
              { Label: 'Reputational', Value: 4 },
              { Label: 'Operational', Value: 6 },
            ],
          },
          {
            user: riskManagerUser1,
          }
        );

        assessmentResults = await getRiskAssessmentResults(
          {
            ParentId: assessment.Id!,
          },
          {
            user: riskManagerUser1,
          }
        );
      });

      it('should insert risk assessment result with multiple impacts', () => {
        expect(
          insertResult.data?.insertChildRiskAssessmentResult?.Ids
        ).toBeDefined();
        expect(
          insertResult.data?.insertChildRiskAssessmentResult?.Ids
        ).toHaveLength(1);
      });

      it('should store overall and individual impact values', () => {
        expect(assessmentResults).toHaveLength(1);
        expect(assessmentResults[0].Impact).toEqual(4);

        expect(assessmentResults[0].impacts).toHaveLength(3);
        expect(assessmentResults[0].impacts).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ Label: 'Financial', Value: 2 }),
            expect.objectContaining({ Label: 'Reputational', Value: 4 }),
            expect.objectContaining({ Label: 'Operational', Value: 6 }),
          ])
        );
      });

      it('should stamp ConfigId from the latest config', () => {
        expect(assessmentResults).toHaveLength(1);
        expect(assessmentResults[0].ConfigId).toBeDefined();
        expect(assessmentResults[0].ConfigId).not.toBeNull();
      });
    });
  });

  describe('updateChildRiskAssessmentResult', () => {
    let riskAssessmentResult: RiskAssessmentResultInsertInput;
    let assessment: AssessmentInsertInput;
    let risk: RiskInsertInput;

    beforeEach(async () => {
      assessment = buildAssessment();
      await insertAssessments({
        objects: [assessment],
      });
      risk = buildRisk();
      await apiClient.insertRisk({ objects: risk });

      riskAssessmentResult = buildRiskAssessmentResult({
        parents: {
          data: [
            buildAssessmentResultParent({
              ParentId: assessment.Id,
              ParentType: ParentTypeEnum.Assessment,
              ResultType: ParentTypeEnum.RiskAssessmentResult,
            }),
            buildAssessmentResultParent({
              ParentId: risk.Id,
              ParentType: ParentTypeEnum.Risk,
              ResultType: ParentTypeEnum.RiskAssessmentResult,
            }),
          ],
        },
      });

      await insertRiskAssessmentResult(riskAssessmentResult);
    });

    it.each([customerSupportUser1, riskManagerUser1])(
      '$RoleKey should update risk assessment results',
      async (user) => {
        const result = await updateChildRiskAssessmentResult(
          {
            Id: riskAssessmentResult.Id!,
            Rating: 0,
          },
          { user }
        );
        expect(
          result.data?.updateChildRiskAssessmentResult?.affected_rows
        ).toEqual(1);
      }
    );

    it.each([
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      readOnlyUser1,
    ])('$RoleKey should NOT update risk assessment results', async (user) => {
      await expect(
        updateChildRiskAssessmentResult(
          {
            Id: riskAssessmentResult.Id!,
            Rating: 0,
          },
          { user }
        )
      ).rejects.toThrowError(
        "field 'updateChildRiskAssessmentResult' not found in type: 'mutation_root'"
      );
    });

    it('should update risk assessment result fields successfully', async () => {
      const updatedRiskAssessmentResult = buildUpdateChildRiskAssessmentResult({
        Id: riskAssessmentResult.Id!,
        Rating: 1,
        Likelihood: 2,
        Impact: 3,
        Rationale: 'updated',
        TestDate: '2021-01-01T00:00:00+00:00',
        CustomAttributeData: '{ "abc": 123 }',
        AssessmentId: assessment.Id,
      });

      await updateChildRiskAssessmentResult(updatedRiskAssessmentResult, {
        user: riskManagerUser1,
      });

      const assessmentResults = await getRiskAssessmentResults(
        {
          ParentId: assessment.Id!,
        },
        {
          user: riskManagerUser1,
        }
      );

      expect(assessmentResults.length).toEqual(1);
      const assessmentResult = assessmentResults[0];
      expect(assessmentResult.CustomAttributeData).toEqual(
        updatedRiskAssessmentResult.CustomAttributeData
      );
      expect(assessmentResult.Impact).toEqual(
        updatedRiskAssessmentResult.Impact
      );
      expect(assessmentResult.Rating).toEqual(
        updatedRiskAssessmentResult.Rating
      );
      expect(assessmentResult.TestDate).toEqual(
        updatedRiskAssessmentResult.TestDate
      );
      expect(assessmentResult.Likelihood).toEqual(
        updatedRiskAssessmentResult.Likelihood
      );
      expect(assessmentResult.Rationale).toEqual(
        updatedRiskAssessmentResult.Rationale
      );
      expect(assessmentResult.RatingType).toEqual('assessment');
    });

    it('should unlink from parent assessment', async () => {
      const updatedRiskAssessmentResult = buildUpdateChildRiskAssessmentResult({
        Id: riskAssessmentResult.Id!,
        AssessmentId: null,
      });

      await updateChildRiskAssessmentResult(updatedRiskAssessmentResult, {
        user: riskManagerUser1,
      });

      const assessmentResults = await getRiskAssessmentResults(
        {
          ParentId: assessment.Id!,
        },
        {
          user: riskManagerUser1,
        }
      );

      expect(assessmentResults.length).toEqual(0);

      const assessmentResultsByRisk = await getRiskAssessmentResults(
        {
          ParentId: risk.Id!,
        },
        {
          user: riskManagerUser1,
        }
      );

      expect(assessmentResultsByRisk.length).toEqual(1);
      expect(assessmentResultsByRisk[0].RatingType).toEqual('rating');
    });

    it('should update parent assessment', async () => {
      const assessment2 = buildAssessment();
      await insertAssessments({
        objects: [assessment2],
      });

      const updatedRiskAssessmentResult = buildUpdateChildRiskAssessmentResult({
        Id: riskAssessmentResult.Id!,
        AssessmentId: assessment2.Id,
      });

      await updateChildRiskAssessmentResult(updatedRiskAssessmentResult, {
        user: riskManagerUser1,
      });

      const assessmentResults = await getRiskAssessmentResults(
        {
          ParentId: assessment.Id!,
        },
        {
          user: riskManagerUser1,
        }
      );

      expect(assessmentResults.length).toEqual(0);

      const assessment2Results = await getRiskAssessmentResults(
        {
          ParentId: assessment2.Id!,
        },
        {
          user: riskManagerUser1,
        }
      );

      expect(assessment2Results.length).toEqual(1);
      expect(assessment2Results[0].RatingType).toEqual('assessment');
    });

    describe('with multiple impacts', () => {
      let assessmentResults: Awaited<
        ReturnType<typeof getRiskAssessmentResults>
      >;

      beforeEach(async () => {
        await insertRiskAssessmentResultConfig(
          { Config: buildRiskAssessmentResultConfig() },
          { user: riskManagerUser1, orgId: getDefaultOrgId() }
        );

        await updateChildRiskAssessmentResult(
          {
            Id: riskAssessmentResult.Id!,
            AssessmentId: assessment.Id,
            Impacts: [
              { Label: 'Financial', Value: 2 },
              { Label: 'Reputational', Value: 4 },
              { Label: 'Operational', Value: 6 },
            ],
          },
          {
            user: riskManagerUser1,
          }
        );

        assessmentResults = await getRiskAssessmentResults(
          {
            ParentId: assessment.Id!,
          },
          {
            user: riskManagerUser1,
          }
        );
      });

      it('should update risk assessment result with multiple impacts', () => {
        expect(assessmentResults).toHaveLength(1);
      });

      it('should store overall and individual impact values', () => {
        expect(assessmentResults[0].Impact).toEqual(4);

        expect(assessmentResults[0].impacts).toHaveLength(3);
        expect(assessmentResults[0].impacts).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ Label: 'Financial', Value: 2 }),
            expect.objectContaining({ Label: 'Reputational', Value: 4 }),
            expect.objectContaining({ Label: 'Operational', Value: 6 }),
          ])
        );
      });

      it('should replace existing impacts when updating with new impacts', async () => {
        await updateChildRiskAssessmentResult(
          {
            Id: riskAssessmentResult.Id!,
            AssessmentId: assessment.Id,
            Impacts: [
              { Label: 'Legal', Value: 1 },
              { Label: 'Strategic', Value: 3 },
              { Label: 'Environmental', Value: 5 },
            ],
          },
          {
            user: riskManagerUser1,
          }
        );

        const updatedResults = await getRiskAssessmentResults(
          {
            ParentId: assessment.Id!,
          },
          {
            user: riskManagerUser1,
          }
        );

        expect(updatedResults[0].Impact).toEqual(3);
        expect(updatedResults[0].impacts).toHaveLength(3);
        expect(updatedResults[0].impacts).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ Label: 'Legal', Value: 1 }),
            expect.objectContaining({ Label: 'Strategic', Value: 3 }),
            expect.objectContaining({ Label: 'Environmental', Value: 5 }),
          ])
        );
      });
    });
  });

  describe('updateRiskAssessmentResult (backend only)', () => {
    it.each([
      customerSupportUser1,
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      readOnlyUser1,
    ])(
      '$RoleKey should NOT be able to update a risk assessment result (backend only)',
      async (user) => {
        const assessment = buildAssessment();
        await insertAssessments({
          objects: [assessment],
        });
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        const riskAssessmentResult = buildRiskAssessmentResult({
          parents: {
            data: [
              buildAssessmentResultParent({
                ParentId: assessment.Id,
                ParentType: ParentTypeEnum.Assessment,
                ResultType: ParentTypeEnum.RiskAssessmentResult,
              }),
              buildAssessmentResultParent({
                ParentId: risk.Id,
                ParentType: ParentTypeEnum.Risk,
                ResultType: ParentTypeEnum.RiskAssessmentResult,
              }),
            ],
          },
        });

        await insertRiskAssessmentResult(riskAssessmentResult);

        await expect(
          updateRiskAssessmentResult(
            {
              Id: riskAssessmentResult.Id!,
              Rating: 0,
            },
            { user }
          )
        ).rejects.toThrowError(
          "field 'update_risk_assessment_result' not found in type: 'mutation_root'"
        );
      }
    );
  });
});
