import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import {
  buildControl,
  buildControlTestInternalAuditResult,
  buildDocument,
  buildDocumentInternalAuditResult,
  buildInternalAuditReport,
  buildInternalAuditResultParent,
  buildObligationInternalAuditResult,
  buildRiskControlledInternalAuditResult,
  buildRiskUncontrolledInternalAuditResult,
  insertControl,
  insertControlTestInternalAuditResult,
  insertDocument,
  insertDocumentInternalAuditResult,
  insertInternalAuditReport,
  insertInternalAuditResultParent,
  insertObligationInternalAuditResult,
  insertRiskControlledInternalAuditResult,
  insertRiskUncontrolledInternalAuditResult,
} from '@risksmart-app/test-data';
import { randomUUID } from 'crypto';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('internal audit', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  async function createInternalAuditReport(options: {
    orgKey: string;
    userId: string;
    reportId: string;
  }) {
    const internalAuditReport = buildInternalAuditReport(
      options.orgKey,
      options.userId,
      {
        Id: options.reportId,
      }
    );
    await insertInternalAuditReport(internalAuditReport);

    return options.reportId;
  }

  describe('internalAuditResultByParentId query', () => {
    it('should return document internal audit results', async () => {
      const { orgKey, userId, trpcClient } = context;
      const parentId = randomUUID();

      // Create internal audit report
      await createInternalAuditReport({ orgKey, userId, reportId: parentId });

      // Create a document internal audit result
      const documentResultId = randomUUID();
      const documentResult = buildDocumentInternalAuditResult(orgKey, userId, {
        Id: documentResultId,
      });
      await insertDocumentInternalAuditResult(documentResult);

      // Create parent relationship for the document result
      const documentResultParent = buildInternalAuditResultParent(
        orgKey,
        userId,
        {
          Id: documentResultId,
          ParentId: parentId,
          ResultType: ParentTypes.DocumentInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        }
      );
      await insertInternalAuditResultParent(documentResultParent);

      const response =
        await trpcClient.frontend.internalAuditResult.internalAuditResultByParentId.query(
          {
            parentId,
          }
        );

      // Test that our document result is returned
      expect(response.document_internal_audit_result).toHaveLength(1);
      expect(response.document_internal_audit_result[0]).toEqual({
        Id: documentResultId,
        Rating: 3,
        TestDate: '2024-01-15T10:00:00Z',
        ancestorContributors: [],
        files: [],
        parents: [],
        Rationale: null,
        CustomAttributeData: null,
      });
    });

    it('should return obligation internal audit results', async () => {
      const { orgKey, userId, trpcClient } = context;
      const parentId = randomUUID();

      // Create internal audit report
      await createInternalAuditReport({ orgKey, userId, reportId: parentId });

      // Create an obligation internal audit result
      const obligationResultId = randomUUID();
      const obligationResult = buildObligationInternalAuditResult(
        orgKey,
        userId,
        {
          Id: obligationResultId,
        }
      );
      await insertObligationInternalAuditResult(obligationResult);

      // Create parent relationship for the obligation result
      const obligationResultParent = buildInternalAuditResultParent(
        orgKey,
        userId,
        {
          Id: obligationResultId,
          ParentId: parentId,
          ResultType: ParentTypes.ObligationInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        }
      );
      await insertInternalAuditResultParent(obligationResultParent);

      const response =
        await trpcClient.frontend.internalAuditResult.internalAuditResultByParentId.query(
          {
            parentId,
          }
        );

      // Test that our obligation result is returned
      expect(response.obligation_internal_audit_result).toHaveLength(1);
      expect(response.obligation_internal_audit_result[0]).toEqual({
        Id: obligationResultId,
        Rating: 4,
        TestDate: '2024-01-15T10:00:00Z',
        ancestorContributors: [],
        files: [],
        parents: [],
        Rationale: null,
        CustomAttributeData: null,
      });
    });

    it('should return risk controlled internal audit results', async () => {
      const { orgKey, userId, trpcClient } = context;
      const parentId = randomUUID();

      // Create internal audit report
      await createInternalAuditReport({ orgKey, userId, reportId: parentId });

      // Create a risk controlled internal audit result
      const riskControlledResultId = randomUUID();
      const riskControlledResult = buildRiskControlledInternalAuditResult(
        orgKey,
        userId,
        {
          Id: riskControlledResultId,
        }
      );
      await insertRiskControlledInternalAuditResult(riskControlledResult);

      // Create parent relationship for the risk controlled result
      const riskControlledResultParent = buildInternalAuditResultParent(
        orgKey,
        userId,
        {
          Id: riskControlledResultId,
          ParentId: parentId,
          ResultType: ParentTypes.RiskControlledInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        }
      );
      await insertInternalAuditResultParent(riskControlledResultParent);

      const response =
        await trpcClient.frontend.internalAuditResult.internalAuditResultByParentId.query(
          {
            parentId,
          }
        );

      // Test that our risk controlled result is returned
      expect(response.risk_controlled_internal_audit_result).toHaveLength(1);
      expect(response.risk_controlled_internal_audit_result[0]).toEqual({
        Id: riskControlledResultId,
        Rating: 2,
        TestDate: '2024-01-15T10:00:00Z',
        ancestorContributors: [],
        files: [],
        parents: [],
        Rationale: null,
        CustomAttributeData: null,
        Likelihood: null,
      });
    });

    it('should return risk uncontrolled internal audit results', async () => {
      const { orgKey, userId, trpcClient } = context;
      const parentId = randomUUID();

      // Create internal audit report
      await createInternalAuditReport({ orgKey, userId, reportId: parentId });

      // Create a risk uncontrolled internal audit result
      const riskUncontrolledResultId = randomUUID();
      const riskUncontrolledResult = buildRiskUncontrolledInternalAuditResult(
        orgKey,
        userId,
        {
          Id: riskUncontrolledResultId,
        }
      );
      await insertRiskUncontrolledInternalAuditResult(riskUncontrolledResult);

      // Create parent relationship for the risk uncontrolled result
      const riskUncontrolledResultParent = buildInternalAuditResultParent(
        orgKey,
        userId,
        {
          Id: riskUncontrolledResultId,
          ParentId: parentId,
          ResultType: ParentTypes.RiskUncontrolledInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        }
      );
      await insertInternalAuditResultParent(riskUncontrolledResultParent);

      const response =
        await trpcClient.frontend.internalAuditResult.internalAuditResultByParentId.query(
          {
            parentId,
          }
        );

      // Test that our risk uncontrolled result is returned
      expect(response.risk_uncontrolled_internal_audit_result).toHaveLength(1);
      expect(response.risk_uncontrolled_internal_audit_result[0]).toEqual({
        Id: riskUncontrolledResultId,
        Rating: 5,
        TestDate: '2024-01-15T10:00:00Z',
        ancestorContributors: [],
        files: [],
        parents: [],
        Rationale: null,
        CustomAttributeData: null,
        Likelihood: null,
      });
    });

    it('should return control test internal audit results', async () => {
      const { orgKey, userId, trpcClient } = context;
      const parentId = randomUUID();

      // Create internal audit report
      await createInternalAuditReport({ orgKey, userId, reportId: parentId });

      // Create a control for the control test result
      const controlId = randomUUID();
      const control = buildControl(orgKey, userId, {
        Id: controlId,
      });
      await insertControl(control);

      // Create a control test internal audit result
      const controlTestResultId = randomUUID();
      const controlTestResult = buildControlTestInternalAuditResult(
        orgKey,
        userId,
        {
          Id: controlTestResultId,
          ParentControlId: controlId,
        }
      );
      await insertControlTestInternalAuditResult(controlTestResult);

      // Create parent relationship for the control test result
      const controlTestResultParent = buildInternalAuditResultParent(
        orgKey,
        userId,
        {
          Id: controlTestResultId,
          ParentId: parentId,
          ResultType: ParentTypes.ControlTestInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        }
      );
      await insertInternalAuditResultParent(controlTestResultParent);

      const response =
        await trpcClient.frontend.internalAuditResult.internalAuditResultByParentId.query(
          {
            parentId,
          }
        );

      // Test that our control test result is returned
      expect(response.control_test_internal_audit_result).toHaveLength(1);
      expect(response.control_test_internal_audit_result[0]).toEqual(
        expect.objectContaining({
          Id: controlTestResultId,
          CreatedByUser: userId,
          CustomAttributeData: null,
          Description: 'Test control description',
          DesignEffectiveness: 3,
          ModifiedByUser: userId,
          OverallEffectiveness: 3,
          ParentControlId: controlId,
          PerformanceEffectiveness: 3,
          Submitter: userId,
          TestDate: '2024-01-15T10:00:00Z',
          TestType: '1stLine',
          Title: 'Test Control Title',
          files: [],
          CreatedAtTimestamp: '2024-01-15T10:00:00Z',
          ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          parent: expect.objectContaining({
            CreatedAtTimestamp: '2024-01-15T10:00:00Z',
            CreatedByUser: userId,
            CustomAttributeData: {},
            Description: 'Test control description',
            Id: controlId,
            ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
            ModifiedByUser: userId,
            Title: 'Test Control',
            Type: 'Preventive',
            schedule: null,
          }),
        })
      );
    });

    it('should return empty arrays for non-existent result types', async () => {
      const { orgKey, userId, trpcClient } = context;
      const parentId = randomUUID();

      // Create internal audit report
      await createInternalAuditReport({ orgKey, userId, reportId: parentId });

      const response =
        await trpcClient.frontend.internalAuditResult.internalAuditResultByParentId.query(
          {
            parentId,
          }
        );

      expect(response.impact_internal_audit_rating).toHaveLength(0);
      expect(response.impact).toHaveLength(0);
      expect(response.action).toHaveLength(0);
      expect(response.issue).toHaveLength(0);
      expect(response.document_internal_audit_result).toHaveLength(0);
      expect(response.obligation_internal_audit_result).toHaveLength(0);
      expect(response.risk_controlled_internal_audit_result).toHaveLength(0);
      expect(response.risk_uncontrolled_internal_audit_result).toHaveLength(0);
      expect(response.control_test_internal_audit_result).toHaveLength(0);
    });
  });

  describe('getInternalAuditResultById query', () => {
    it('should return document internal audit result by id', async () => {
      const { orgKey, userId, trpcClient } = context;
      const parentId = randomUUID();

      // Create internal audit report
      await createInternalAuditReport({ orgKey, userId, reportId: parentId });

      // Create a document internal audit result
      const documentResultId = randomUUID();
      const documentResult = buildDocumentInternalAuditResult(orgKey, userId, {
        Id: documentResultId,
      });
      await insertDocumentInternalAuditResult(documentResult);

      // Create parent relationship for the document result
      const documentResultParent = buildInternalAuditResultParent(
        orgKey,
        userId,
        {
          Id: documentResultId,
          ParentId: parentId,
          ResultType: ParentTypes.DocumentInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        }
      );
      await insertInternalAuditResultParent(documentResultParent);

      const response =
        await trpcClient.frontend.internalAuditResult.internalAuditResultById.query(
          {
            internalAuditResultId: documentResultId,
          }
        );

      // Test that our document result is returned
      expect(response).toHaveLength(1);
      expect(response[0]).toEqual({
        Id: documentResultId,
        ParentId: parentId,
        ResultType: ParentTypes.DocumentInternalAuditResult,
        ParentType: ParentTypes.InternalAuditReport,
        documentAssessmentResult: {
          Id: documentResultId,
          Rating: 3,
          TestDate: '2024-01-15T10:00:00Z',
          Rationale: null,
          CustomAttributeData: null,
        },
        obligationAssessmentResult: null,
        controlledRiskAssessmentResult: null,
        uncontrolledRiskAssessmentResult: null,
        testResult: null,
        impactRating: null,
      });
    });

    it('should return obligation internal audit result by id', async () => {
      const { orgKey, userId, trpcClient } = context;
      const parentId = randomUUID();

      // Create internal audit report
      await createInternalAuditReport({ orgKey, userId, reportId: parentId });

      // Create an obligation internal audit result
      const obligationResultId = randomUUID();
      const obligationResult = buildObligationInternalAuditResult(
        orgKey,
        userId,
        {
          Id: obligationResultId,
        }
      );
      await insertObligationInternalAuditResult(obligationResult);

      // Create parent relationship for the obligation result
      const obligationResultParent = buildInternalAuditResultParent(
        orgKey,
        userId,
        {
          Id: obligationResultId,
          ParentId: parentId,
          ResultType: ParentTypes.ObligationInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        }
      );
      await insertInternalAuditResultParent(obligationResultParent);

      const response =
        await trpcClient.frontend.internalAuditResult.internalAuditResultById.query(
          {
            internalAuditResultId: obligationResultId,
          }
        );

      // Test that our obligation result is returned
      expect(response).toHaveLength(1);
      expect(response[0]).toEqual({
        Id: obligationResultId,
        ParentId: parentId,
        ResultType: ParentTypes.ObligationInternalAuditResult,
        ParentType: ParentTypes.InternalAuditReport,
        documentAssessmentResult: null,
        obligationAssessmentResult: {
          Id: obligationResultId,
          Rating: 4,
          TestDate: '2024-01-15T10:00:00Z',
          Rationale: null,
          CustomAttributeData: null,
        },
        controlledRiskAssessmentResult: null,
        uncontrolledRiskAssessmentResult: null,
        testResult: null,
        impactRating: null,
      });
    });

    it('should return risk controlled internal audit result by id', async () => {
      const { orgKey, userId, trpcClient } = context;
      const parentId = randomUUID();

      // Create internal audit report
      await createInternalAuditReport({ orgKey, userId, reportId: parentId });

      // Create a risk controlled internal audit result
      const riskControlledResultId = randomUUID();
      const riskControlledResult = buildRiskControlledInternalAuditResult(
        orgKey,
        userId,
        {
          Id: riskControlledResultId,
        }
      );
      await insertRiskControlledInternalAuditResult(riskControlledResult);

      // Create parent relationship for the risk controlled result
      const riskControlledResultParent = buildInternalAuditResultParent(
        orgKey,
        userId,
        {
          Id: riskControlledResultId,
          ParentId: parentId,
          ResultType: ParentTypes.RiskControlledInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        }
      );
      await insertInternalAuditResultParent(riskControlledResultParent);

      const response =
        await trpcClient.frontend.internalAuditResult.internalAuditResultById.query(
          {
            internalAuditResultId: riskControlledResultId,
          }
        );

      // Test that our risk controlled result is returned
      expect(response).toHaveLength(1);
      expect(response[0]).toEqual({
        Id: riskControlledResultId,
        ParentId: parentId,
        ResultType: ParentTypes.RiskControlledInternalAuditResult,
        ParentType: ParentTypes.InternalAuditReport,
        documentAssessmentResult: null,
        obligationAssessmentResult: null,
        controlledRiskAssessmentResult: {
          Id: riskControlledResultId,
          Rating: 2,
          TestDate: '2024-01-15T10:00:00Z',
          Rationale: null,
          CustomAttributeData: null,
          Likelihood: null,
        },
        uncontrolledRiskAssessmentResult: null,
        testResult: null,
        impactRating: null,
      });
    });

    it('should return risk uncontrolled internal audit result by id', async () => {
      const { orgKey, userId, trpcClient } = context;
      const parentId = randomUUID();

      // Create internal audit report
      await createInternalAuditReport({ orgKey, userId, reportId: parentId });

      // Create a risk uncontrolled internal audit result
      const riskUncontrolledResultId = randomUUID();
      const riskUncontrolledResult = buildRiskUncontrolledInternalAuditResult(
        orgKey,
        userId,
        {
          Id: riskUncontrolledResultId,
        }
      );
      await insertRiskUncontrolledInternalAuditResult(riskUncontrolledResult);

      // Create parent relationship for the risk uncontrolled result
      const riskUncontrolledResultParent = buildInternalAuditResultParent(
        orgKey,
        userId,
        {
          Id: riskUncontrolledResultId,
          ParentId: parentId,
          ResultType: ParentTypes.RiskUncontrolledInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        }
      );
      await insertInternalAuditResultParent(riskUncontrolledResultParent);

      const response =
        await trpcClient.frontend.internalAuditResult.internalAuditResultById.query(
          {
            internalAuditResultId: riskUncontrolledResultId,
          }
        );

      // Test that our risk uncontrolled result is returned
      expect(response).toHaveLength(1);
      expect(response[0]).toEqual({
        Id: riskUncontrolledResultId,
        ParentId: parentId,
        ResultType: ParentTypes.RiskUncontrolledInternalAuditResult,
        ParentType: ParentTypes.InternalAuditReport,
        documentAssessmentResult: null,
        obligationAssessmentResult: null,
        controlledRiskAssessmentResult: null,
        uncontrolledRiskAssessmentResult: {
          Id: riskUncontrolledResultId,
          Rating: 5,
          TestDate: '2024-01-15T10:00:00Z',
          Rationale: null,
          CustomAttributeData: null,
          Likelihood: null,
        },
        testResult: null,
        impactRating: null,
      });
    });

    it('should return control test internal audit result by id', async () => {
      const { orgKey, userId, trpcClient } = context;
      const parentId = randomUUID();

      // Create internal audit report
      await createInternalAuditReport({ orgKey, userId, reportId: parentId });

      // Create a control for the control test result
      const controlId = randomUUID();
      const control = buildControl(orgKey, userId, {
        Id: controlId,
      });
      await insertControl(control);

      // Create a control test internal audit result
      const controlTestResultId = randomUUID();
      const controlTestResult = buildControlTestInternalAuditResult(
        orgKey,
        userId,
        {
          Id: controlTestResultId,
          ParentControlId: controlId,
        }
      );
      await insertControlTestInternalAuditResult(controlTestResult);

      // Create parent relationship for the control test result
      const controlTestResultParent = buildInternalAuditResultParent(
        orgKey,
        userId,
        {
          Id: controlTestResultId,
          ParentId: parentId,
          ResultType: ParentTypes.ControlTestInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        }
      );
      await insertInternalAuditResultParent(controlTestResultParent);

      const response =
        await trpcClient.frontend.internalAuditResult.internalAuditResultById.query(
          {
            internalAuditResultId: controlTestResultId,
          }
        );

      // Test that our control test result is returned
      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: controlTestResultId,
          ParentId: parentId,
          ResultType: ParentTypes.ControlTestInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
          documentAssessmentResult: null,
          obligationAssessmentResult: null,
          controlledRiskAssessmentResult: null,
          uncontrolledRiskAssessmentResult: null,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          testResult: expect.objectContaining({
            Id: controlTestResultId,
            CreatedByUser: userId,
            CustomAttributeData: null,
            Description: 'Test control description',
            DesignEffectiveness: 3,
            ModifiedByUser: userId,
            OverallEffectiveness: 3,
            ParentControlId: controlId,
            PerformanceEffectiveness: 3,
            Submitter: userId,
            TestDate: '2024-01-15T10:00:00Z',
            TestType: '1stLine',
            Title: 'Test Control Title',
            CreatedAtTimestamp: '2024-01-15T10:00:00Z',
            ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
          }),
          impactRating: null,
        })
      );
    });

    it('should return empty array for non-existent id', async () => {
      const { trpcClient } = context;
      const nonExistentId = randomUUID();

      const response =
        await trpcClient.frontend.internalAuditResult.internalAuditResultById.query(
          {
            internalAuditResultId: nonExistentId,
          }
        );

      expect(response).toHaveLength(0);
    });
  });

  describe('internalAuditTestResultById query', () => {
    it('should return control test internal audit result by id', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a control for the control test result
      const controlId = randomUUID();
      const control = buildControl(orgKey, userId, {
        Id: controlId,
      });
      await insertControl(control);

      // Create a control test internal audit result
      const controlTestResultId = randomUUID();
      const controlTestResult = buildControlTestInternalAuditResult(
        orgKey,
        userId,
        {
          Id: controlTestResultId,
          ParentControlId: controlId,
        }
      );
      await insertControlTestInternalAuditResult(controlTestResult);

      const response =
        await trpcClient.frontend.internalAuditTestResult.internalAuditTestResultById.query(
          {
            id: controlTestResultId,
          }
        );

      expect(response).toHaveLength(1);
      expect(response[0]).toMatchObject({
        Id: controlTestResultId,
        Title: 'Test Control Title',
        Description: 'Test control description',
        ParentControlId: controlId,
        TestType: '1stLine',
        DesignEffectiveness: 3,
        PerformanceEffectiveness: 3,
        OverallEffectiveness: 3,
        TestDate: '2024-01-15T10:00:00Z',
        Submitter: userId,
        CreatedByUser: userId,
        ModifiedByUser: userId,
        files: [],
      });
    });

    it('should return empty array for non-existent id', async () => {
      const { trpcClient } = context;
      const nonExistentId = randomUUID();

      const response =
        await trpcClient.frontend.internalAuditTestResult.internalAuditTestResultById.query(
          {
            id: nonExistentId,
          }
        );

      expect(response).toHaveLength(0);
    });
  });

  describe('latestDocumentInternalAuditResultByDocumentId query', () => {
    it('should return the latest document internal audit result when one exists', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a document
      const documentId = randomUUID();
      const document = buildDocument(orgKey, userId, {
        Id: documentId,
      });
      await insertDocument(document);

      // Create an internal audit report
      const parentId = randomUUID();
      await createInternalAuditReport({
        orgKey,
        userId,
        reportId: parentId,
      });

      // Create a document internal audit result
      const documentResultId = randomUUID();
      const documentResult = buildDocumentInternalAuditResult(orgKey, userId, {
        Id: documentResultId,
        TestDate: '2024-01-15T10:00:00Z',
        Rating: 3,
      });
      await insertDocumentInternalAuditResult(documentResult);

      // Create parent relationship linking the document result to the document
      const documentResultParent = buildInternalAuditResultParent(
        orgKey,
        userId,
        {
          Id: documentResultId,
          ParentId: documentId,
          ResultType: ParentTypes.DocumentInternalAuditResult,
          ParentType: ParentTypes.Document,
        }
      );
      await insertInternalAuditResultParent(documentResultParent);

      // Create parent relationship linking the document result to the audit report
      const auditReportParent = buildInternalAuditResultParent(orgKey, userId, {
        Id: documentResultId,
        ParentId: parentId,
        ResultType: ParentTypes.DocumentInternalAuditResult,
        ParentType: ParentTypes.InternalAuditReport,
      });
      await insertInternalAuditResultParent(auditReportParent);

      const response =
        await trpcClient.frontend.internalAuditResult.latestDocumentInternalAuditResultByDocumentId.query(
          {
            documentId,
          }
        );

      expect(response).toHaveLength(1);
      expect(response[0]).toMatchObject({
        Id: documentResultId,
        Rating: 3,
        TestDate: '2024-01-15T10:00:00Z',
        Rationale: null,
        CustomAttributeData: null,
        ancestorContributors: [],
      });
      // Check parents separately to avoid nested expect matchers
      const parentWithAuditReport = response[0]?.parents?.find(
        (p) => p.internalAuditReport?.Id === parentId
      );
      expect(parentWithAuditReport).toBeDefined();
    });

    it('should return the latest result when multiple results exist', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a document
      const documentId = randomUUID();
      const document = buildDocument(orgKey, userId, {
        Id: documentId,
      });
      await insertDocument(document);

      // Create an internal audit report
      const parentId = randomUUID();
      await createInternalAuditReport({
        orgKey,
        userId,
        reportId: parentId,
      });

      // Create older document internal audit result
      const olderResultId = randomUUID();
      const olderResult = buildDocumentInternalAuditResult(orgKey, userId, {
        Id: olderResultId,
        TestDate: '2024-01-01T10:00:00Z',
        Rating: 2,
      });
      await insertDocumentInternalAuditResult(olderResult);

      // Create parent relationships for older result
      await insertInternalAuditResultParent(
        buildInternalAuditResultParent(orgKey, userId, {
          Id: olderResultId,
          ParentId: documentId,
          ResultType: ParentTypes.DocumentInternalAuditResult,
          ParentType: ParentTypes.Document,
        })
      );
      await insertInternalAuditResultParent(
        buildInternalAuditResultParent(orgKey, userId, {
          Id: olderResultId,
          ParentId: parentId,
          ResultType: ParentTypes.DocumentInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        })
      );

      // Create newer document internal audit result
      const newerResultId = randomUUID();
      const newerResult = buildDocumentInternalAuditResult(orgKey, userId, {
        Id: newerResultId,
        TestDate: '2024-01-20T10:00:00Z',
        Rating: 4,
      });
      await insertDocumentInternalAuditResult(newerResult);

      // Create parent relationships for newer result
      await insertInternalAuditResultParent(
        buildInternalAuditResultParent(orgKey, userId, {
          Id: newerResultId,
          ParentId: documentId,
          ResultType: ParentTypes.DocumentInternalAuditResult,
          ParentType: ParentTypes.Document,
        })
      );
      await insertInternalAuditResultParent(
        buildInternalAuditResultParent(orgKey, userId, {
          Id: newerResultId,
          ParentId: parentId,
          ResultType: ParentTypes.DocumentInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        })
      );

      const response =
        await trpcClient.frontend.internalAuditResult.latestDocumentInternalAuditResultByDocumentId.query(
          {
            documentId,
          }
        );

      // Should only return the latest result (newer one)
      expect(response).toHaveLength(1);
      expect(response[0]).toMatchObject({
        Id: newerResultId,
        Rating: 4,
        TestDate: '2024-01-20T10:00:00Z',
        Rationale: null,
        CustomAttributeData: null,
        ancestorContributors: [],
      });
      // Check parents separately to avoid nested expect matchers
      const parentWithAuditReport = response[0]?.parents?.find(
        (p) => p.internalAuditReport?.Id === parentId
      );
      expect(parentWithAuditReport).toBeDefined();
    });

    it('should return empty array when no result exists for the document', async () => {
      const { trpcClient } = context;
      const nonExistentDocumentId = randomUUID();

      const response =
        await trpcClient.frontend.internalAuditResult.latestDocumentInternalAuditResultByDocumentId.query(
          {
            documentId: nonExistentDocumentId,
          }
        );

      expect(response).toHaveLength(0);
    });

    it('should filter by documentId and not return results from other documents', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create two documents
      const documentId1 = randomUUID();
      const document1 = buildDocument(orgKey, userId, {
        Id: documentId1,
      });
      await insertDocument(document1);

      const documentId2 = randomUUID();
      const document2 = buildDocument(orgKey, userId, {
        Id: documentId2,
      });
      await insertDocument(document2);

      // Create internal audit reports with different sequential IDs
      const parentId1 = randomUUID();
      await createInternalAuditReport({
        orgKey,
        userId,
        reportId: parentId1,
      });

      const parentId2 = randomUUID();
      await createInternalAuditReport({
        orgKey,
        userId,
        reportId: parentId2,
      });

      // Create result for document 1
      const result1Id = randomUUID();
      const result1 = buildDocumentInternalAuditResult(orgKey, userId, {
        Id: result1Id,
        Rating: 3,
      });
      await insertDocumentInternalAuditResult(result1);
      await insertInternalAuditResultParent(
        buildInternalAuditResultParent(orgKey, userId, {
          Id: result1Id,
          ParentId: documentId1,
          ResultType: ParentTypes.DocumentInternalAuditResult,
          ParentType: ParentTypes.Document,
        })
      );
      await insertInternalAuditResultParent(
        buildInternalAuditResultParent(orgKey, userId, {
          Id: result1Id,
          ParentId: parentId1,
          ResultType: ParentTypes.DocumentInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        })
      );

      // Create result for document 2
      const result2Id = randomUUID();
      const result2 = buildDocumentInternalAuditResult(orgKey, userId, {
        Id: result2Id,
        Rating: 5,
      });
      await insertDocumentInternalAuditResult(result2);
      await insertInternalAuditResultParent(
        buildInternalAuditResultParent(orgKey, userId, {
          Id: result2Id,
          ParentId: documentId2,
          ResultType: ParentTypes.DocumentInternalAuditResult,
          ParentType: ParentTypes.Document,
        })
      );
      await insertInternalAuditResultParent(
        buildInternalAuditResultParent(orgKey, userId, {
          Id: result2Id,
          ParentId: parentId2,
          ResultType: ParentTypes.DocumentInternalAuditResult,
          ParentType: ParentTypes.InternalAuditReport,
        })
      );

      // Query for document 1 results
      const response =
        await trpcClient.frontend.internalAuditResult.latestDocumentInternalAuditResultByDocumentId.query(
          {
            documentId: documentId1,
          }
        );

      // Should only return result for document 1
      expect(response).toHaveLength(1);
      expect(response[0]?.Id).toEqual(result1Id);
    });
  });
});
