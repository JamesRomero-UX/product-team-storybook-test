import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import {
  buildAssessment,
  buildAssessmentActivity,
  buildAssessmentResultParent,
  buildComplianceMonitoringAssessment,
  buildControl,
  buildDocument,
  buildDocumentAssessmentResult,
  buildInternalAuditReport,
  buildInternalAuditResultParent,
  buildObligationAssessmentResult,
  buildRisk,
  buildRiskAssessmentResult,
  buildRiskControlledInternalAuditResult,
  buildRiskControlledSecondLineResult,
  buildRiskUncontrolledInternalAuditResult,
  buildRiskUncontrolledSecondLineResult,
  buildSecondLineResultParent,
  buildTestResult,
  insertAssessment,
  insertAssessmentActivity,
  insertAssessmentResultParent,
  insertComplianceMonitoringAssessment,
  insertControl,
  insertDocument,
  insertDocumentAssessmentResult,
  insertInternalAuditReport,
  insertInternalAuditResultParent,
  insertObligationAssessmentResult,
  insertRisk,
  insertRiskAssessmentResult,
  insertRiskControlledInternalAuditResult,
  insertRiskControlledSecondLineResult,
  insertRiskUncontrolledInternalAuditResult,
  insertRiskUncontrolledSecondLineResult,
  insertSecondLineResultParent,
  insertTestResult,
} from '@risksmart-app/test-data';
import { randomUUID } from 'crypto';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createTestContext } from '../../utils/test-context';

const createAndInsertAssessmentResult = async <T, R>({
  buildFn,
  insertFn,
  orgKey,
  userId,
}: {
  buildFn: (params: { orgKey: string; userId: string }) => T;
  insertFn: (result: T) => Promise<R | null | undefined>;
  orgKey: string;
  userId: string;
}) => {
  const result = buildFn({ orgKey, userId });
  const inserted = await insertFn(result);

  if (!inserted) {
    throw new Error(`Failed to insert result`);
  }

  return { original: result, inserted };
};

describe('assessments', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  it('assessmentActivitiesByParentId query should return correct data', async () => {
    const { orgKey, userId, trpcClient } = context;

    const assessment = buildAssessment(orgKey, userId);

    await insertAssessment(assessment);

    const assessmentActivity = buildAssessmentActivity({
      orgKey,
      userId,
      parentId: assessment.Id!,
    });

    await insertAssessmentActivity(assessmentActivity);

    const response =
      await trpcClient.frontend.assessment.assessmentActivitiesByParentId.query(
        { id: assessment.Id! }
      );

    expect(response.length).toEqual(1);
    expect(response[0]).toEqual(
      expect.objectContaining({
        Id: assessmentActivity.Id,
        ParentId: assessment.Id!,
        IsRCSA: false,
        Title: assessmentActivity.Title,
        Status: assessmentActivity.Status,
        ActivityType: assessmentActivity.ActivityType,
      })
    );
  });

  it('register query should return list of assessments', async () => {
    const { orgKey, userId, trpcClient } = context;

    const assessment = buildAssessment(orgKey, userId);
    const { OrgKey, ...insertedAssessmentProps } = assessment;
    await insertAssessment({ OrgKey, ...insertedAssessmentProps });

    const response = await trpcClient.frontend.assessment.register.query();

    expect(response.assessment).toBeDefined();
    expect(response.assessment.length).toEqual(1);
    expect(response.assessment[0]).toEqual(
      expect.objectContaining({
        ...insertedAssessmentProps,
        assessmentResults: [],
        contributorGroups: [],
        contributors: [],
        departments: [],
        ownerGroups: [],
        owners: [],
        tags: [],
      })
    );

    // Assert createdByUser separately to avoid nested any warnings
    expect(response.assessment[0]?.createdByUser).toBeDefined();
    expect(typeof response.assessment[0]?.createdByUser?.FriendlyName).toBe(
      'string'
    );
  });

  it('getById query should return assessment details', async () => {
    const { orgKey, userId, trpcClient } = context;

    const assessment = buildAssessment(orgKey, userId);
    const { OrgKey, ...insertedAssessmentProps } = assessment;
    await insertAssessment({ OrgKey, ...insertedAssessmentProps });

    const response = await trpcClient.frontend.assessment.getById.query({
      id: assessment.Id!,
    });

    expect(response.length).toEqual(1);
    expect(response[0]).toEqual(
      expect.objectContaining({
        ...insertedAssessmentProps,
        ancestorContributors: [],
        completedByUser: null,
        contributorGroups: [],
        contributors: [],
        departments: [],
        ownerGroups: [],
        owners: [],
        tags: [],
      })
    );
  });

  it('activityRegister query should return list of assessment activities', async () => {
    const { orgKey, userId, trpcClient } = context;

    const assessment = buildAssessment(orgKey, userId);
    await insertAssessment(assessment);

    const assessmentActivity = buildAssessmentActivity({
      orgKey,
      userId,
      parentId: assessment.Id!,
    });
    await insertAssessmentActivity(assessmentActivity);

    const response =
      await trpcClient.frontend.assessment.activityRegister.query();

    expect(response.assessment_activity).toBeDefined();
    expect(response.assessment_activity.length).toEqual(1);
    expect(response.assessment_activity[0]).toEqual(
      expect.objectContaining({
        Id: assessmentActivity.Id,
        Title: assessmentActivity.Title,
        Status: assessmentActivity.Status,
        ActivityType: assessmentActivity.ActivityType,
      })
    );
  });

  it('resultParents.getById query should return assessment result parent details', async () => {
    const { orgKey, userId, trpcClient } = context;

    // Create assessment
    const assessment = buildAssessment(orgKey, userId);
    const insertedAssessment = await insertAssessment(assessment);

    if (!insertedAssessment) {
      throw new Error('Failed to insert assessment');
    }

    // Create a control
    const controlInput = buildControl(orgKey, userId);
    const insertedControl = await insertControl(controlInput);

    if (!insertedControl) {
      throw new Error('Failed to insert control');
    }

    // Create a test result for the control
    const testResult = buildTestResult({
      orgKey,
      userId,
      ParentControlId: insertedControl.Id,
    });
    const insertedTestResult = await insertTestResult(testResult);

    if (!insertedTestResult) {
      throw new Error('Failed to insert test result');
    }

    const {
      CreatedAtTimestamp,
      CreatedByUser,
      ModifiedByUser,
      ModifiedAtTimestamp,
      Id,
      Description,
      SequentialId,
      Title,
      CustomAttributeData,
      NextTestDate,
      TestDate,
      RatingType,
      Submitter,
      ParentControlId,
      TestType,
      DesignEffectiveness,
      PerformanceEffectiveness,
      OverallEffectiveness,
    } = insertedTestResult;

    const assessmentResultParent = buildAssessmentResultParent({
      orgKey,
      userId,
      parentId: insertedAssessment.Id,
      overrides: {
        Id: insertedTestResult.Id,
        ResultType: ParentTypes.TestResult,
      },
    });

    const insertedAssessmentResultParent = await insertAssessmentResultParent(
      assessmentResultParent
    );

    if (!insertedAssessmentResultParent) {
      throw new Error('Failed to insert assessment result parent');
    }

    const response =
      await trpcClient.frontend.assessment.resultParents.getById.query({
        id: insertedAssessmentResultParent.Id,
      });

    expect(response.length).toEqual(1);
    expect(response[0]).toEqual(
      expect.objectContaining({
        Id: insertedAssessmentResultParent.Id,
        ParentId: assessment.Id!,
        ResultType: ParentTypes.TestResult,
        ParentType: ParentTypes.Assessment,
        impactRating: null,
        obligationAssessmentResult: null,
        documentAssessmentResult: null,
        riskAssessmentResult: null,
        testResult: {
          CreatedAtTimestamp,
          CreatedByUser,
          ModifiedByUser,
          ModifiedAtTimestamp,
          Id,
          Description,
          SequentialId,
          Title,
          CustomAttributeData,
          NextTestDate,
          TestDate,
          RatingType,
          Submitter,
          ParentControlId,
          TestType,
          DesignEffectiveness,
          PerformanceEffectiveness,
          OverallEffectiveness,
        },
      })
    );
  });

  it('resultsRegister query should return all assessment result types', async () => {
    const { orgKey, userId, trpcClient } = context;

    // Create assessment results data (nodes will be created by database triggers)
    const { original: documentResult, inserted: insertedDocumentResult } =
      await createAndInsertAssessmentResult({
        buildFn: buildDocumentAssessmentResult,
        insertFn: insertDocumentAssessmentResult,
        orgKey,
        userId,
      });

    const { original: obligationResult, inserted: insertedObligationResult } =
      await createAndInsertAssessmentResult({
        buildFn: buildObligationAssessmentResult,
        insertFn: insertObligationAssessmentResult,
        orgKey,
        userId,
      });

    const { original: riskResult, inserted: insertedRiskResult } =
      await createAndInsertAssessmentResult({
        buildFn: buildRiskAssessmentResult,
        insertFn: insertRiskAssessmentResult,
        orgKey,
        userId,
      });

    const response =
      await trpcClient.frontend.assessment.resultsRegister.query();

    expect(response.document_assessment_result[0]).toEqual({
      Id: insertedDocumentResult.Id,
      Rating: documentResult.Rating,
      CustomAttributeData: documentResult.CustomAttributeData,
      Rationale: documentResult.Rationale,
      TestDate: documentResult.TestDate,
      CreatedAtTimestamp: documentResult.CreatedAtTimestamp,
      files: [],
      parents: [],
    });

    expect(response.obligation_assessment_result[0]).toEqual({
      Id: insertedObligationResult.Id,
      Rating: obligationResult.Rating,
      CustomAttributeData: obligationResult.CustomAttributeData,
      Rationale: obligationResult.Rationale,
      TestDate: obligationResult.TestDate,
      CreatedAtTimestamp: obligationResult.CreatedAtTimestamp,
      files: [],
      parents: [],
    });

    expect(response.risk_assessment_result[0]).toEqual({
      Id: insertedRiskResult.Id,
      Likelihood: riskResult.Likelihood,
      Impact: riskResult.Impact,
      Rating: riskResult.Rating,
      ControlType: riskResult.ControlType,
      CustomAttributeData: riskResult.CustomAttributeData,
      Rationale: riskResult.Rationale,
      TestDate: riskResult.TestDate,
      CreatedByUser: riskResult.CreatedByUser,
      CreatedAtTimestamp: riskResult.CreatedAtTimestamp,
      ModifiedByUser: riskResult.ModifiedByUser,
      ModifiedAtTimestamp: riskResult.ModifiedAtTimestamp,
      RatingType: riskResult.RatingType,
      ConfigId: null,
      files: [],
      parents: [],
    });
  });

  describe('riskAssessmentResultsByRiskId', () => {
    it('should return risk assessment results for a risk', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      const assessment = buildAssessment(orgKey, userId);
      await insertAssessment(assessment);

      const riskAssessmentResult = buildRiskAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Rating: 12,
          Likelihood: 3,
          Impact: 4,
          RatingType: 'rating',
        },
      });
      const insertedRiskAssessmentResult =
        await insertRiskAssessmentResult(riskAssessmentResult);

      if (!insertedRiskAssessmentResult) {
        throw new Error('Failed to insert risk assessment result');
      }

      const assessmentResultParent = buildAssessmentResultParent({
        orgKey,
        userId,
        parentId: riskId,
        overrides: {
          Id: insertedRiskAssessmentResult.Id,
          ResultType: ParentTypes.RiskAssessmentResult,
          ParentType: ParentTypes.Risk,
        },
      });
      await insertAssessmentResultParent(assessmentResultParent);

      const response =
        await trpcClient.frontend.assessment.riskAssessmentResultsByRiskId.query(
          { riskId }
        );

      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: insertedRiskAssessmentResult.Id,
          Rating: riskAssessmentResult.Rating,
          Likelihood: riskAssessmentResult.Likelihood,
          Impact: riskAssessmentResult.Impact,
          ControlType: riskAssessmentResult.ControlType,
          RatingType: riskAssessmentResult.RatingType,
        })
      );
    });

    it('should return empty array when no risk assessment results exist for a risk', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      const response =
        await trpcClient.frontend.assessment.riskAssessmentResultsByRiskId.query(
          { riskId }
        );

      expect(response).toHaveLength(0);
    });

    it('should return results with RatingType "assessment" for a risk', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      const riskAssessmentResult = buildRiskAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Rating: 8,
          Likelihood: 2,
          Impact: 4,
          RatingType: ParentTypes.Assessment,
        },
      });
      const insertedRiskAssessmentResult =
        await insertRiskAssessmentResult(riskAssessmentResult);

      if (!insertedRiskAssessmentResult) {
        throw new Error('Failed to insert risk assessment result');
      }

      const assessmentResultParent = buildAssessmentResultParent({
        orgKey,
        userId,
        parentId: riskId,
        overrides: {
          Id: insertedRiskAssessmentResult.Id,
          ResultType: ParentTypes.RiskAssessmentResult,
          ParentType: ParentTypes.Risk,
        },
      });
      await insertAssessmentResultParent(assessmentResultParent);

      const response =
        await trpcClient.frontend.assessment.riskAssessmentResultsByRiskId.query(
          { riskId }
        );

      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: insertedRiskAssessmentResult.Id,
          RatingType: ParentTypes.Assessment,
        })
      );
    });

    it('should filter out results with invalid RatingType', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      const validResultId = randomUUID();
      const validResult = buildRiskAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: validResultId,
          Rating: 12,
          RatingType: 'rating',
        },
      });
      await insertRiskAssessmentResult(validResult);
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: riskId,
          overrides: {
            Id: validResultId,
            ResultType: ParentTypes.RiskAssessmentResult,
            ParentType: ParentTypes.Risk,
          },
        })
      );

      const invalidResultId = randomUUID();
      const invalidResult = buildRiskAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: invalidResultId,
          Rating: 5,
          RatingType: 'other_type',
        },
      });
      await insertRiskAssessmentResult(invalidResult);
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: riskId,
          overrides: {
            Id: invalidResultId,
            ResultType: ParentTypes.RiskAssessmentResult,
            ParentType: ParentTypes.Risk,
          },
        })
      );

      const response =
        await trpcClient.frontend.assessment.riskAssessmentResultsByRiskId.query(
          { riskId }
        );

      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: validResultId,
          Rating: 12,
        })
      );
    });

    it('should return results ordered by CreatedAtTimestamp descending', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      const olderResultId = randomUUID();
      const olderResult = buildRiskAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: olderResultId,
          Rating: 6,
          CreatedAtTimestamp: '2024-01-01T10:00:00Z',
        },
      });
      await insertRiskAssessmentResult(olderResult);
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: riskId,
          overrides: {
            Id: olderResultId,
            ResultType: ParentTypes.RiskAssessmentResult,
            ParentType: ParentTypes.Risk,
          },
        })
      );

      const newerResultId = randomUUID();
      const newerResult = buildRiskAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: newerResultId,
          Rating: 12,
          CreatedAtTimestamp: '2024-02-01T10:00:00Z',
        },
      });
      await insertRiskAssessmentResult(newerResult);
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: riskId,
          overrides: {
            Id: newerResultId,
            ResultType: ParentTypes.RiskAssessmentResult,
            ParentType: ParentTypes.Risk,
          },
        })
      );

      const response =
        await trpcClient.frontend.assessment.riskAssessmentResultsByRiskId.query(
          { riskId }
        );

      expect(response).toHaveLength(2);
      expect(response[0]?.Id).toBe(newerResultId);
      expect(response[1]?.Id).toBe(olderResultId);
    });
  });

  describe('latestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId', () => {
    it('should return the latest controlled and uncontrolled risk assessment results for a risk', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk
      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      // Create a compliance monitoring assessment
      const complianceAssessmentId = randomUUID();
      const complianceAssessment = buildComplianceMonitoringAssessment(
        orgKey,
        userId,
        { Id: complianceAssessmentId }
      );
      await insertComplianceMonitoringAssessment(complianceAssessment);

      // Create controlled result
      const controlledResultId = randomUUID();
      const controlledResult = buildRiskControlledSecondLineResult(
        orgKey,
        userId,
        { Id: controlledResultId, Rating: 3 }
      );
      await insertRiskControlledSecondLineResult(controlledResult);

      // Create parent relationship for controlled result
      const controlledResultParent = buildSecondLineResultParent(
        orgKey,
        userId,
        {
          Id: controlledResultId,
          ParentId: riskId,
          ResultType: ParentTypes.RiskControlledSecondLineResult,
          ParentType: ParentTypes.ComplianceMonitoringAssessment,
        }
      );
      await insertSecondLineResultParent(controlledResultParent);

      // Create uncontrolled result
      const uncontrolledResultId = randomUUID();
      const uncontrolledResult = buildRiskUncontrolledSecondLineResult(
        orgKey,
        userId,
        { Id: uncontrolledResultId, Rating: 4 }
      );
      await insertRiskUncontrolledSecondLineResult(uncontrolledResult);

      // Create parent relationship for uncontrolled result
      const uncontrolledResultParent = buildSecondLineResultParent(
        orgKey,
        userId,
        {
          Id: uncontrolledResultId,
          ParentId: riskId,
          ResultType: ParentTypes.RiskUncontrolledSecondLineResult,
          ParentType: ParentTypes.ComplianceMonitoringAssessment,
        }
      );
      await insertSecondLineResultParent(uncontrolledResultParent);

      const response =
        await trpcClient.frontend.assessment.latestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId.query(
          { riskId }
        );

      expect(response.controlled).toHaveLength(1);
      expect(response.controlled[0]).toEqual(
        expect.objectContaining({
          Id: controlledResultId,
          Rating: 3,
          TestDate: controlledResult.TestDate,
        })
      );

      expect(response.uncontrolled).toHaveLength(1);
      expect(response.uncontrolled[0]).toEqual(
        expect.objectContaining({
          Id: uncontrolledResultId,
          Rating: 4,
          TestDate: uncontrolledResult.TestDate,
        })
      );
    });

    it('should return empty arrays when no risk assessment results exist for a risk', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk with no assessment results
      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      const response =
        await trpcClient.frontend.assessment.latestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId.query(
          { riskId }
        );

      expect(response.controlled).toHaveLength(0);
      expect(response.uncontrolled).toHaveLength(0);
    });

    it('should return only the latest result when multiple results exist', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk
      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      // Create compliance monitoring assessment
      const complianceAssessmentId = randomUUID();
      const complianceAssessment = buildComplianceMonitoringAssessment(
        orgKey,
        userId,
        { Id: complianceAssessmentId }
      );
      await insertComplianceMonitoringAssessment(complianceAssessment);

      // Create older controlled result
      const olderControlledResultId = randomUUID();
      const olderControlledResult = buildRiskControlledSecondLineResult(
        orgKey,
        userId,
        {
          Id: olderControlledResultId,
          Rating: 2,
          TestDate: '2023-01-01T10:00:00Z',
        }
      );
      await insertRiskControlledSecondLineResult(olderControlledResult);
      await insertSecondLineResultParent(
        buildSecondLineResultParent(orgKey, userId, {
          Id: olderControlledResultId,
          ParentId: riskId,
          ResultType: ParentTypes.RiskControlledSecondLineResult,
          ParentType: ParentTypes.ComplianceMonitoringAssessment,
        })
      );

      // Create newer controlled result
      const newerControlledResultId = randomUUID();
      const newerControlledResult = buildRiskControlledSecondLineResult(
        orgKey,
        userId,
        {
          Id: newerControlledResultId,
          Rating: 5,
          TestDate: '2024-01-15T10:00:00Z',
        }
      );
      await insertRiskControlledSecondLineResult(newerControlledResult);
      await insertSecondLineResultParent(
        buildSecondLineResultParent(orgKey, userId, {
          Id: newerControlledResultId,
          ParentId: riskId,
          ResultType: ParentTypes.RiskControlledSecondLineResult,
          ParentType: ParentTypes.ComplianceMonitoringAssessment,
        })
      );

      const response =
        await trpcClient.frontend.assessment.latestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId.query(
          { riskId }
        );

      // Should return only the newer result (limit 1 with orderBy TestDate desc)
      expect(response.controlled).toHaveLength(1);
      expect(response.controlled[0]).toEqual(
        expect.objectContaining({
          Id: newerControlledResultId,
          Rating: 5,
          TestDate: newerControlledResult.TestDate,
        })
      );
    });
  });

  describe('latestInternalAuditReportRiskAssessmentResultsByRiskId', () => {
    it('should return the latest controlled and uncontrolled risk assessment results for a risk', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk
      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      // Create an internal audit report
      const internalAuditReportId = randomUUID();
      const internalAuditReport = buildInternalAuditReport(orgKey, userId, {
        Id: internalAuditReportId,
      });
      await insertInternalAuditReport(internalAuditReport);

      // Create controlled result
      const controlledResultId = randomUUID();
      const controlledResult = buildRiskControlledInternalAuditResult(
        orgKey,
        userId,
        { Id: controlledResultId, Rating: 3 }
      );
      await insertRiskControlledInternalAuditResult(controlledResult);

      // Create parent relationship for controlled result
      const controlledResultParent = buildInternalAuditResultParent(
        orgKey,
        userId,
        {
          Id: controlledResultId,
          ParentId: riskId,
          ResultType: ParentTypes.RiskControlledInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        }
      );
      await insertInternalAuditResultParent(controlledResultParent);

      // Create uncontrolled result
      const uncontrolledResultId = randomUUID();
      const uncontrolledResult = buildRiskUncontrolledInternalAuditResult(
        orgKey,
        userId,
        { Id: uncontrolledResultId, Rating: 4 }
      );
      await insertRiskUncontrolledInternalAuditResult(uncontrolledResult);

      // Create parent relationship for uncontrolled result
      const uncontrolledResultParent = buildInternalAuditResultParent(
        orgKey,
        userId,
        {
          Id: uncontrolledResultId,
          ParentId: riskId,
          ResultType: ParentTypes.RiskUncontrolledInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        }
      );
      await insertInternalAuditResultParent(uncontrolledResultParent);

      const response =
        await trpcClient.frontend.assessment.latestInternalAuditReportRiskAssessmentResultsByRiskId.query(
          { riskId }
        );

      expect(response.controlled).toHaveLength(1);
      expect(response.controlled[0]).toEqual(
        expect.objectContaining({
          Id: controlledResultId,
          Rating: 3,
          TestDate: controlledResult.TestDate,
        })
      );

      expect(response.uncontrolled).toHaveLength(1);
      expect(response.uncontrolled[0]).toEqual(
        expect.objectContaining({
          Id: uncontrolledResultId,
          Rating: 4,
          TestDate: uncontrolledResult.TestDate,
        })
      );
    });

    it('should return empty arrays when no risk assessment results exist for a risk', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk with no assessment results
      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      const response =
        await trpcClient.frontend.assessment.latestInternalAuditReportRiskAssessmentResultsByRiskId.query(
          { riskId }
        );

      expect(response.controlled).toHaveLength(0);
      expect(response.uncontrolled).toHaveLength(0);
    });

    it('should return only the latest result when multiple results exist', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk
      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      // Create internal audit report
      const internalAuditReportId = randomUUID();
      const internalAuditReport = buildInternalAuditReport(orgKey, userId, {
        Id: internalAuditReportId,
      });
      await insertInternalAuditReport(internalAuditReport);

      // Create older controlled result
      const olderControlledResultId = randomUUID();
      const olderControlledResult = buildRiskControlledInternalAuditResult(
        orgKey,
        userId,
        {
          Id: olderControlledResultId,
          Rating: 2,
          TestDate: '2023-01-01T10:00:00Z',
        }
      );
      await insertRiskControlledInternalAuditResult(olderControlledResult);
      await insertInternalAuditResultParent(
        buildInternalAuditResultParent(orgKey, userId, {
          Id: olderControlledResultId,
          ParentId: riskId,
          ResultType: ParentTypes.RiskControlledInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        })
      );

      // Create newer controlled result
      const newerControlledResultId = randomUUID();
      const newerControlledResult = buildRiskControlledInternalAuditResult(
        orgKey,
        userId,
        {
          Id: newerControlledResultId,
          Rating: 5,
          TestDate: '2024-01-15T10:00:00Z',
        }
      );
      await insertRiskControlledInternalAuditResult(newerControlledResult);
      await insertInternalAuditResultParent(
        buildInternalAuditResultParent(orgKey, userId, {
          Id: newerControlledResultId,
          ParentId: riskId,
          ResultType: ParentTypes.RiskControlledInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        })
      );

      const response =
        await trpcClient.frontend.assessment.latestInternalAuditReportRiskAssessmentResultsByRiskId.query(
          { riskId }
        );

      // Should return only the newer result (limit 1 with orderBy TestDate desc)
      expect(response.controlled).toHaveLength(1);
      expect(response.controlled[0]).toEqual(
        expect.objectContaining({
          Id: newerControlledResultId,
          Rating: 5,
          TestDate: newerControlledResult.TestDate,
        })
      );
    });
  });

  describe('complianceMonitoringAssessmentRiskAssessmentResultsByRiskId', () => {
    it('should return all controlled and uncontrolled risk assessment results for a risk', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk
      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      // Create a compliance monitoring assessment
      const complianceAssessmentId = randomUUID();
      const complianceAssessment = buildComplianceMonitoringAssessment(
        orgKey,
        userId,
        { Id: complianceAssessmentId }
      );
      await insertComplianceMonitoringAssessment(complianceAssessment);

      // Create controlled result
      const controlledResultId = randomUUID();
      const controlledResult = buildRiskControlledSecondLineResult(
        orgKey,
        userId,
        { Id: controlledResultId, Rating: 3 }
      );
      await insertRiskControlledSecondLineResult(controlledResult);

      // Create parent relationship for controlled result
      const controlledResultParent = buildSecondLineResultParent(
        orgKey,
        userId,
        {
          Id: controlledResultId,
          ParentId: riskId,
          ResultType: ParentTypes.RiskControlledSecondLineResult,
          ParentType: ParentTypes.ComplianceMonitoringAssessment,
        }
      );
      await insertSecondLineResultParent(controlledResultParent);

      // Create uncontrolled result
      const uncontrolledResultId = randomUUID();
      const uncontrolledResult = buildRiskUncontrolledSecondLineResult(
        orgKey,
        userId,
        { Id: uncontrolledResultId, Rating: 4 }
      );
      await insertRiskUncontrolledSecondLineResult(uncontrolledResult);

      // Create parent relationship for uncontrolled result
      const uncontrolledResultParent = buildSecondLineResultParent(
        orgKey,
        userId,
        {
          Id: uncontrolledResultId,
          ParentId: riskId,
          ResultType: ParentTypes.RiskUncontrolledSecondLineResult,
          ParentType: ParentTypes.ComplianceMonitoringAssessment,
        }
      );
      await insertSecondLineResultParent(uncontrolledResultParent);

      const response =
        await trpcClient.frontend.assessment.complianceMonitoringAssessmentRiskAssessmentResultsByRiskId.query(
          { riskId }
        );

      expect(response.risk_controlled_second_line_result).toHaveLength(1);
      expect(response.risk_controlled_second_line_result[0]).toEqual(
        expect.objectContaining({
          Id: controlledResultId,
          Rating: 3,
          TestDate: controlledResult.TestDate,
        })
      );

      expect(response.risk_uncontrolled_second_line_result).toHaveLength(1);
      expect(response.risk_uncontrolled_second_line_result[0]).toEqual(
        expect.objectContaining({
          Id: uncontrolledResultId,
          Rating: 4,
          TestDate: uncontrolledResult.TestDate,
        })
      );
    });

    it('should return empty arrays when no risk assessment results exist for a risk', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk with no assessment results
      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      const response =
        await trpcClient.frontend.assessment.complianceMonitoringAssessmentRiskAssessmentResultsByRiskId.query(
          { riskId }
        );

      expect(response.risk_controlled_second_line_result).toHaveLength(0);
      expect(response.risk_uncontrolled_second_line_result).toHaveLength(0);
    });

    it('should return all results when multiple results exist (ordered by CreatedAtTimestamp desc)', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk
      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      // Create compliance monitoring assessment
      const complianceAssessmentId = randomUUID();
      const complianceAssessment = buildComplianceMonitoringAssessment(
        orgKey,
        userId,
        { Id: complianceAssessmentId }
      );
      await insertComplianceMonitoringAssessment(complianceAssessment);

      // Create first controlled result (older)
      const firstControlledResultId = randomUUID();
      const firstControlledResult = buildRiskControlledSecondLineResult(
        orgKey,
        userId,
        {
          Id: firstControlledResultId,
          Rating: 2,
        }
      );
      await insertRiskControlledSecondLineResult(firstControlledResult);
      await insertSecondLineResultParent(
        buildSecondLineResultParent(orgKey, userId, {
          Id: firstControlledResultId,
          ParentId: riskId,
          ResultType: ParentTypes.RiskControlledSecondLineResult,
          ParentType: ParentTypes.ComplianceMonitoringAssessment,
        })
      );

      // Create second controlled result (newer)
      const secondControlledResultId = randomUUID();
      const secondControlledResult = buildRiskControlledSecondLineResult(
        orgKey,
        userId,
        {
          Id: secondControlledResultId,
          Rating: 5,
        }
      );
      await insertRiskControlledSecondLineResult(secondControlledResult);
      await insertSecondLineResultParent(
        buildSecondLineResultParent(orgKey, userId, {
          Id: secondControlledResultId,
          ParentId: riskId,
          ResultType: ParentTypes.RiskControlledSecondLineResult,
          ParentType: ParentTypes.ComplianceMonitoringAssessment,
        })
      );

      const response =
        await trpcClient.frontend.assessment.complianceMonitoringAssessmentRiskAssessmentResultsByRiskId.query(
          { riskId }
        );

      // Should return all results (no limit)
      expect(response.risk_controlled_second_line_result).toHaveLength(2);

      // Results should be ordered by CreatedAtTimestamp desc (newer first)
      expect(response.risk_controlled_second_line_result[0]).toEqual(
        expect.objectContaining({
          Id: secondControlledResultId,
          Rating: 5,
        })
      );
      expect(response.risk_controlled_second_line_result[1]).toEqual(
        expect.objectContaining({
          Id: firstControlledResultId,
          Rating: 2,
        })
      );
    });
  });

  describe('internalAuditReportRiskAssessmentResultsByRiskId', () => {
    it('should return all controlled and uncontrolled risk assessment results for a risk', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk
      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      // Create an internal audit report
      const internalAuditReportId = randomUUID();
      const internalAuditReport = buildInternalAuditReport(orgKey, userId, {
        Id: internalAuditReportId,
      });
      await insertInternalAuditReport(internalAuditReport);

      // Create controlled result
      const controlledResultId = randomUUID();
      const controlledResult = buildRiskControlledInternalAuditResult(
        orgKey,
        userId,
        { Id: controlledResultId, Rating: 3 }
      );
      await insertRiskControlledInternalAuditResult(controlledResult);

      // Create parent relationship for controlled result
      const controlledResultParent = buildInternalAuditResultParent(
        orgKey,
        userId,
        {
          Id: controlledResultId,
          ParentId: riskId,
          ResultType: ParentTypes.RiskControlledInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        }
      );
      await insertInternalAuditResultParent(controlledResultParent);

      // Create uncontrolled result
      const uncontrolledResultId = randomUUID();
      const uncontrolledResult = buildRiskUncontrolledInternalAuditResult(
        orgKey,
        userId,
        { Id: uncontrolledResultId, Rating: 4 }
      );
      await insertRiskUncontrolledInternalAuditResult(uncontrolledResult);

      // Create parent relationship for uncontrolled result
      const uncontrolledResultParent = buildInternalAuditResultParent(
        orgKey,
        userId,
        {
          Id: uncontrolledResultId,
          ParentId: riskId,
          ResultType: ParentTypes.RiskUncontrolledInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        }
      );
      await insertInternalAuditResultParent(uncontrolledResultParent);

      const response =
        await trpcClient.frontend.assessment.internalAuditReportRiskAssessmentResultsByRiskId.query(
          { riskId }
        );

      expect(response.risk_controlled_internal_audit_result).toHaveLength(1);
      expect(response.risk_controlled_internal_audit_result[0]).toEqual(
        expect.objectContaining({
          Id: controlledResultId,
          Rating: 3,
          TestDate: controlledResult.TestDate,
        })
      );

      expect(response.risk_uncontrolled_internal_audit_result).toHaveLength(1);
      expect(response.risk_uncontrolled_internal_audit_result[0]).toEqual(
        expect.objectContaining({
          Id: uncontrolledResultId,
          Rating: 4,
          TestDate: uncontrolledResult.TestDate,
        })
      );
    });

    it('should return empty arrays when no risk assessment results exist for a risk', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk with no assessment results
      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      const response =
        await trpcClient.frontend.assessment.internalAuditReportRiskAssessmentResultsByRiskId.query(
          { riskId }
        );

      expect(response.risk_controlled_internal_audit_result).toHaveLength(0);
      expect(response.risk_uncontrolled_internal_audit_result).toHaveLength(0);
    });

    it('should return all results when multiple results exist', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk
      const riskId = randomUUID();
      const risk = buildRisk({ orgKey, userId, riskId });
      await insertRisk(risk);

      // Create internal audit report
      const internalAuditReportId = randomUUID();
      const internalAuditReport = buildInternalAuditReport(orgKey, userId, {
        Id: internalAuditReportId,
      });
      await insertInternalAuditReport(internalAuditReport);

      // Create first controlled result
      const firstControlledResultId = randomUUID();
      const firstControlledResult = buildRiskControlledInternalAuditResult(
        orgKey,
        userId,
        {
          Id: firstControlledResultId,
          Rating: 2,
        }
      );
      await insertRiskControlledInternalAuditResult(firstControlledResult);
      await insertInternalAuditResultParent(
        buildInternalAuditResultParent(orgKey, userId, {
          Id: firstControlledResultId,
          ParentId: riskId,
          ResultType: ParentTypes.RiskControlledInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        })
      );

      // Create second controlled result
      const secondControlledResultId = randomUUID();
      const secondControlledResult = buildRiskControlledInternalAuditResult(
        orgKey,
        userId,
        {
          Id: secondControlledResultId,
          Rating: 5,
        }
      );
      await insertRiskControlledInternalAuditResult(secondControlledResult);
      await insertInternalAuditResultParent(
        buildInternalAuditResultParent(orgKey, userId, {
          Id: secondControlledResultId,
          ParentId: riskId,
          ResultType: ParentTypes.RiskControlledInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        })
      );

      const response =
        await trpcClient.frontend.assessment.internalAuditReportRiskAssessmentResultsByRiskId.query(
          { riskId }
        );

      // Should return all results (no limit)
      expect(response.risk_controlled_internal_audit_result).toHaveLength(2);

      // Verify both results are present
      const resultIds = response.risk_controlled_internal_audit_result.map(
        (r) => r.Id
      );
      expect(resultIds).toContain(firstControlledResultId);
      expect(resultIds).toContain(secondControlledResultId);
    });
  });

  describe('latestDocumentAssessmentResultByDocumentId', () => {
    it('should return document assessment results for a given document ID', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a document
      const documentId = randomUUID();
      const document = buildDocument(orgKey, userId, { Id: documentId });
      await insertDocument(document);

      // Create an assessment
      const assessmentId = randomUUID();
      const assessment = buildAssessment(orgKey, userId, { Id: assessmentId });
      await insertAssessment(assessment);

      // Create a document assessment result
      const documentAssessmentResultId = randomUUID();
      const documentAssessmentResult = buildDocumentAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: documentAssessmentResultId,
          Rating: 4,
          RatingType: 'rating',
        },
      });
      await insertDocumentAssessmentResult(documentAssessmentResult);

      // Create parent relationship linking the result to the document
      const resultParent = buildAssessmentResultParent({
        orgKey,
        userId,
        parentId: documentId,
        overrides: {
          Id: documentAssessmentResultId,
          ResultType: ParentTypes.DocumentAssessmentResult,
          ParentType: ParentTypes.Document,
        },
      });
      await insertAssessmentResultParent(resultParent);

      const response =
        await trpcClient.frontend.assessment.latestDocumentAssessmentResultByDocumentId.query(
          { documentId }
        );

      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: documentAssessmentResultId,
          Rating: 4,
          TestDate: documentAssessmentResult.TestDate,
        })
      );
    });

    it('should return empty array when no results exist for the document', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a document with no assessment results
      const documentId = randomUUID();
      const document = buildDocument(orgKey, userId, { Id: documentId });
      await insertDocument(document);

      const response =
        await trpcClient.frontend.assessment.latestDocumentAssessmentResultByDocumentId.query(
          { documentId }
        );

      expect(response).toHaveLength(0);
    });

    it('should return results ordered by TestDate desc, CreatedAtTimestamp desc', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a document
      const documentId = randomUUID();
      const document = buildDocument(orgKey, userId, { Id: documentId });
      await insertDocument(document);

      // Create older result
      const olderResultId = randomUUID();
      const olderResult = buildDocumentAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: olderResultId,
          Rating: 2,
          RatingType: 'rating',
          TestDate: '2023-01-01T10:00:00Z',
          CreatedAtTimestamp: '2023-01-01T10:00:00Z',
        },
      });
      await insertDocumentAssessmentResult(olderResult);
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: documentId,
          overrides: {
            Id: olderResultId,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Document,
          },
        })
      );

      // Create newer result
      const newerResultId = randomUUID();
      const newerResult = buildDocumentAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: newerResultId,
          Rating: 5,
          RatingType: 'assessment',
          TestDate: '2024-06-15T10:00:00Z',
          CreatedAtTimestamp: '2024-06-15T10:00:00Z',
        },
      });
      await insertDocumentAssessmentResult(newerResult);
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: documentId,
          overrides: {
            Id: newerResultId,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Document,
          },
        })
      );

      const response =
        await trpcClient.frontend.assessment.latestDocumentAssessmentResultByDocumentId.query(
          { documentId }
        );

      // Should return both results, ordered by TestDate desc
      expect(response).toHaveLength(2);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: newerResultId,
          Rating: 5,
          TestDate: newerResult.TestDate,
        })
      );
      expect(response[1]).toEqual(
        expect.objectContaining({
          Id: olderResultId,
          Rating: 2,
          TestDate: olderResult.TestDate,
        })
      );
    });

    it('should only return results with RatingType assessment or rating', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a document
      const documentId = randomUUID();
      const document = buildDocument(orgKey, userId, { Id: documentId });
      await insertDocument(document);

      // Create result with valid RatingType
      const validResultId = randomUUID();
      const validResult = buildDocumentAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: validResultId,
          Rating: 4,
          RatingType: 'rating',
        },
      });
      await insertDocumentAssessmentResult(validResult);
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: documentId,
          overrides: {
            Id: validResultId,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Document,
          },
        })
      );

      // Create result with invalid RatingType (should be excluded)
      const invalidResultId = randomUUID();
      const invalidResult = buildDocumentAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: invalidResultId,
          Rating: 1,
          RatingType: 'other_type',
        },
      });
      await insertDocumentAssessmentResult(invalidResult);
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: documentId,
          overrides: {
            Id: invalidResultId,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Document,
          },
        })
      );

      const response =
        await trpcClient.frontend.assessment.latestDocumentAssessmentResultByDocumentId.query(
          { documentId }
        );

      // Should only return the result with valid RatingType
      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: validResultId,
          Rating: 4,
        })
      );
    });
  });
});
