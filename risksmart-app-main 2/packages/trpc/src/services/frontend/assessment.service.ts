import { ParentTypes } from '@risksmart-app/domain/src/types/consts/index';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getAssessmentByIdQueryConfig,
  getAssessmentsRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/assessment.query';
import {
  getAssessmentActivitiesByParentIdConfig,
  getAssessmentActivitiesRegisterQueryConfig,
  getAssessmentRCSAActivitiesByAssessmentIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/assessment-activity.query';
import {
  getAssessmentResultParentByIdQueryConfig,
  getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdControlledQueryConfig,
  getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdUncontrolledQueryConfig,
  getDocumentAssessmentResultsByParentIdQueryConfig,
  getDocumentAssessmentResultsQueryConfig,
  getInternalAuditReportRiskAssessmentResultsByRiskIdControlledQueryConfig,
  getInternalAuditReportRiskAssessmentResultsByRiskIdUncontrolledQueryConfig,
  getLatestDocumentAssessmentResultByDocumentIdQueryConfig,
  getObligationAssessmentResultQueryConfig,
  getRiskAssessmentResultQueryConfig,
  getRiskAssessmentResultsByRiskIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/assessment-result.query';
import type {
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
} from '@risksmart-app/events/src/types/request-types';
import { filter } from '@risksmart-app/permitio/src/permit';

import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import type {
  AssessmentActivitiesByParentIdResponseRow,
  AssessmentActivityRegisterResponseRow,
  AssessmentRCSAActivityByAssessmentIdResponseRow,
  AssessmentRegisterResponseRow,
  AssessmentResultParentByIdResponseRow,
  ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdControlledResponseRow,
  ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse,
  ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdUncontrolledResponseRow,
  DocumentAssessmentResultResponseRow,
  DocumentAssessmentResultsByParentIdResponseRow,
  InternalAuditReportRiskAssessmentResultsByRiskIdControlledResponseRow,
  InternalAuditReportRiskAssessmentResultsByRiskIdUncontrolledResponseRow,
  LatestDocumentAssessmentResultByDocumentIdResponseRow,
  ObligationAssessmentResultResponseRow,
  RiskAssessmentResultResponseRow,
  RiskAssessmentResultsByRiskIdResponseRow,
} from '../../types/index';
import type { AssessmentService, ServiceContext } from '../service.types';

export class AssessmentServiceImpl implements AssessmentService {
  async getAssessmentsRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    // Query assessments with comprehensive relationships
    const data = await db.org((tx) => {
      return tx.query.assessment.findMany({
        ...getAssessmentsRegisterQueryConfig,
      });
    });

    const filteredAssessments = await filter<AssessmentRegisterResponseRow>(
      data,
      'rs_node',
      (entity: AssessmentRegisterResponseRow) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return {
      assessment: filteredAssessments,
    };
  }

  async getAssessmentActivitiesRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    // Query assessments with comprehensive relationships
    const data = await db.org((tx) => {
      return tx.query.assessment_activity.findMany({
        ...getAssessmentActivitiesRegisterQueryConfig,
      });
    });

    const filteredAssessmentActivities =
      await filter<AssessmentActivityRegisterResponseRow>(
        data,
        'rs_node',
        (entity: AssessmentActivityRegisterResponseRow) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return {
      assessment_activity: filteredAssessmentActivities,
    };
  }

  async getAssessmentResultParentById(ctx: ServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);
    // Query assessment result parents with comprehensive relationships
    const data = await db.org((tx) => {
      return tx.query.assessment_result_parent.findMany({
        where: {
          Id: id,
        },
        ...getAssessmentResultParentByIdQueryConfig,
      });
    });

    const filteredAssessmentResultParents =
      await filter<AssessmentResultParentByIdResponseRow>(
        data,
        'rs_node',
        (entity: AssessmentResultParentByIdResponseRow) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredAssessmentResultParents;
  }

  async getAssessmentActivitiesByParentId(ctx: ServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) => {
      return tx.query.assessment_activity.findMany({
        where: {
          ParentId: id,
          IsRCSA: false,
        },
        ...getAssessmentActivitiesByParentIdConfig,
      });
    });

    const filteredAssessmentActivities =
      await filter<AssessmentActivitiesByParentIdResponseRow>(
        data,
        'rs_node',
        (entity: AssessmentActivitiesByParentIdResponseRow) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredAssessmentActivities;
  }

  async getAssessmentById(ctx: ServiceContext, assessmentId: string) {
    const db = await createDrizzleClient(ctx);

    const assessments = await db.org((tx) => {
      return tx.query.assessment.findMany({
        where: {
          Id: assessmentId,
        },
        ...getAssessmentByIdQueryConfig,
      });
    });

    const filteredAssessments = await filter<(typeof assessments)[0]>(
      assessments,
      'rs_node',
      (entity: (typeof assessments)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filteredAssessments;
  }

  async getAssessmentResultsRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    const [
      documentAssessmentResults,
      obligationAssessmentResults,
      riskAssessmentResults,
    ] = await Promise.all([
      db.org((tx) =>
        tx.query.document_assessment_result.findMany({
          ...getDocumentAssessmentResultsQueryConfig,
        })
      ),
      db.org((tx) =>
        tx.query.obligation_assessment_result.findMany({
          ...getObligationAssessmentResultQueryConfig,
        })
      ),
      db.org((tx) =>
        tx.query.risk_assessment_result.findMany({
          ...getRiskAssessmentResultQueryConfig,
        })
      ),
    ]);

    const [
      filteredDocumentAssessmentResults,
      filteredObligationAssessmentResults,
      filteredRiskAssessmentResults,
    ] = await Promise.all([
      filter<DocumentAssessmentResultResponseRow>(
        documentAssessmentResults,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      ),
      filter<ObligationAssessmentResultResponseRow>(
        obligationAssessmentResults,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      ),
      filter<RiskAssessmentResultResponseRow>(
        riskAssessmentResults,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      ),
    ]);

    return {
      document_assessment_result: filteredDocumentAssessmentResults,
      obligation_assessment_result: filteredObligationAssessmentResults,
      risk_assessment_result: filteredRiskAssessmentResults,
    };
  }

  async getRiskAssessmentResultsByRiskId(ctx: ServiceContext, riskId: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.risk_assessment_result.findMany({
        where: {
          parents: {
            ParentId: riskId,
          },
          RatingType: { in: [ParentTypes.Assessment, 'rating'] },
        },
        orderBy: { CreatedAtTimestamp: 'desc' },
        ...getRiskAssessmentResultsByRiskIdQueryConfig,
      })
    );

    const filteredResults =
      await filter<RiskAssessmentResultsByRiskIdResponseRow>(
        data,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredResults;
  }

  async getAssessmentRCSAActivitiesByAssessmentId(
    ctx: ServiceContext,
    assessmentId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const assessmentActivities = await db.org((tx) => {
      return tx.query.assessment_activity.findMany({
        where: {
          ParentId: assessmentId,
          IsRCSA: { eq: true },
        },
        ...getAssessmentRCSAActivitiesByAssessmentIdQueryConfig,
      });
    });

    const filteredAssessmentActivities =
      await filter<AssessmentRCSAActivityByAssessmentIdResponseRow>(
        assessmentActivities,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredAssessmentActivities;
  }

  async getLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId(
    ctx: ServiceContext,
    riskId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const [uncontrolledResults, controlledResults] = await Promise.all([
      db.org((tx) =>
        tx.query.risk_uncontrolled_second_line_result.findMany({
          where: {
            parents: {
              ParentId: riskId,
            },
          },
          orderBy: { TestDate: 'desc', CreatedAtTimestamp: 'desc' },
          limit: 1,
          ...getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdUncontrolledQueryConfig,
        })
      ),
      db.org((tx) =>
        tx.query.risk_controlled_second_line_result.findMany({
          where: {
            parents: {
              ParentId: riskId,
            },
          },
          orderBy: { TestDate: 'desc', CreatedAtTimestamp: 'desc' },
          limit: 1,
          ...getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdControlledQueryConfig,
        })
      ),
    ]);

    const [filteredUncontrolledResults, filteredControlledResults] =
      await Promise.all([
        filter<ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdUncontrolledResponseRow>(
          uncontrolledResults,
          'rs_node',
          (entity) => entity.Id,
          ctx.userId,
          ctx.orgId
        ),
        filter<ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdControlledResponseRow>(
          controlledResults,
          'rs_node',
          (entity) => entity.Id,
          ctx.userId,
          ctx.orgId
        ),
      ]);

    return {
      uncontrolled: filteredUncontrolledResults,
      controlled: filteredControlledResults,
    };
  }

  async getLatestInternalAuditReportRiskAssessmentResultsByRiskId(
    ctx: ServiceContext,
    riskId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const [uncontrolledResults, controlledResults] = await Promise.all([
      db.org((tx) =>
        tx.query.risk_uncontrolled_internal_audit_result.findMany({
          where: {
            parents: {
              ParentId: riskId,
            },
          },
          orderBy: { TestDate: 'desc', CreatedAtTimestamp: 'desc' },
          limit: 1,
          ...getInternalAuditReportRiskAssessmentResultsByRiskIdUncontrolledQueryConfig,
        })
      ),
      db.org((tx) =>
        tx.query.risk_controlled_internal_audit_result.findMany({
          where: {
            parents: {
              ParentId: riskId,
            },
          },
          orderBy: { TestDate: 'desc', CreatedAtTimestamp: 'desc' },
          limit: 1,
          ...getInternalAuditReportRiskAssessmentResultsByRiskIdControlledQueryConfig,
        })
      ),
    ]);

    const [filteredUncontrolledResults, filteredControlledResults] =
      await Promise.all([
        filter<InternalAuditReportRiskAssessmentResultsByRiskIdUncontrolledResponseRow>(
          uncontrolledResults,
          'rs_node',
          (entity) => entity.Id,
          ctx.userId,
          ctx.orgId
        ),
        filter<InternalAuditReportRiskAssessmentResultsByRiskIdControlledResponseRow>(
          controlledResults,
          'rs_node',
          (entity) => entity.Id,
          ctx.userId,
          ctx.orgId
        ),
      ]);

    return {
      uncontrolled: filteredUncontrolledResults,
      controlled: filteredControlledResults,
    };
  }

  async getInternalAuditReportRiskAssessmentResultsByRiskId(
    ctx: ServiceContext,
    riskId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const [uncontrolledResults, controlledResults] = await Promise.all([
      db.org((tx) =>
        tx.query.risk_uncontrolled_internal_audit_result.findMany({
          where: {
            parents: {
              ParentId: riskId,
            },
          },
          ...getInternalAuditReportRiskAssessmentResultsByRiskIdUncontrolledQueryConfig,
        })
      ),
      db.org((tx) =>
        tx.query.risk_controlled_internal_audit_result.findMany({
          where: {
            parents: {
              ParentId: riskId,
            },
          },
          ...getInternalAuditReportRiskAssessmentResultsByRiskIdControlledQueryConfig,
        })
      ),
    ]);

    const [filteredUncontrolledResults, filteredControlledResults] =
      await Promise.all([
        filter<InternalAuditReportRiskAssessmentResultsByRiskIdUncontrolledResponseRow>(
          uncontrolledResults,
          'rs_node',
          (entity) => entity.Id,
          ctx.userId,
          ctx.orgId
        ),
        filter<InternalAuditReportRiskAssessmentResultsByRiskIdControlledResponseRow>(
          controlledResults,
          'rs_node',
          (entity) => entity.Id,
          ctx.userId,
          ctx.orgId
        ),
      ]);

    return {
      risk_uncontrolled_internal_audit_result: filteredUncontrolledResults,
      risk_controlled_internal_audit_result: filteredControlledResults,
    };
  }

  async getLatestDocumentAssessmentResultByDocumentId(
    ctx: ServiceContext,
    documentId: string
  ): Promise<LatestDocumentAssessmentResultByDocumentIdResponseRow[]> {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.document_assessment_result.findMany({
        where: {
          parents: {
            ParentId: documentId,
          },
          RatingType: { in: ['assessment', 'rating'] },
        },
        orderBy: { TestDate: 'desc', CreatedAtTimestamp: 'desc' },
        ...getLatestDocumentAssessmentResultByDocumentIdQueryConfig,
      })
    );

    const filteredResults =
      await filter<LatestDocumentAssessmentResultByDocumentIdResponseRow>(
        data,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredResults;
  }

  async getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId(
    ctx: ServiceContext,
    riskId: string
  ): Promise<ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse> {
    const db = await createDrizzleClient(ctx);

    const [uncontrolledResults, controlledResults] = await Promise.all([
      db.org((tx) =>
        tx.query.risk_uncontrolled_second_line_result.findMany({
          where: {
            parents: {
              ParentId: riskId,
            },
          },
          orderBy: { CreatedAtTimestamp: 'desc' },
          ...getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdUncontrolledQueryConfig,
        })
      ),
      db.org((tx) =>
        tx.query.risk_controlled_second_line_result.findMany({
          where: {
            parents: {
              ParentId: riskId,
            },
          },
          orderBy: { CreatedAtTimestamp: 'desc' },
          ...getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdControlledQueryConfig,
        })
      ),
    ]);

    const [filteredUncontrolledResults, filteredControlledResults] =
      await Promise.all([
        filter<ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdUncontrolledResponseRow>(
          uncontrolledResults,
          'rs_node',
          (entity) => entity.Id,
          ctx.userId,
          ctx.orgId
        ),
        filter<ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdControlledResponseRow>(
          controlledResults,
          'rs_node',
          (entity) => entity.Id,
          ctx.userId,
          ctx.orgId
        ),
      ]);

    return {
      risk_uncontrolled_second_line_result: filteredUncontrolledResults,
      risk_controlled_second_line_result: filteredControlledResults,
    };
  }

  async getDocumentAssessmentResultsByParentId(
    ctx: ServiceContext,
    parentId: string
  ): Promise<DocumentAssessmentResultsByParentIdResponseRow[]> {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.document_assessment_result.findMany({
        where: {
          parents: {
            ParentId: parentId,
          },
          RatingType: { in: ['assessment', 'rating'] },
        },
        ...getDocumentAssessmentResultsByParentIdQueryConfig,
      })
    );

    const filteredResults =
      await filter<DocumentAssessmentResultsByParentIdResponseRow>(
        data,
        'rs_node',
        (entity) => entity.Id,
        ctx.userId,
        ctx.orgId
      );

    return filteredResults;
  }

  async deleteAssessment(ctx: ServiceContext, id: string): Promise<void> {
    await executeAsyncRequest<{ id: string }, void>(
      ctx,
      { id },
      {
        requestType: 'DELETE_ASSESSMENT',
        buildRequestBody: (input) => ({
          Id: input.id,
        }),
        apiCall: (ctx, _input, correlationId) =>
          dataLayerApiClient.deleteAssessment(
            toApiContext(ctx),
            id,
            correlationId
          ),
        successStatus: 204,
        errorMessages: {
          403: 'You do not have permission to delete this assessment',
          404: 'Assessment not found',
        },
      }
    );
  }

  async insertAssessment(ctx: ServiceContext, input: CreateAssessmentRequest) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'CREATE_ASSESSMENT',
      buildRequestBody: (input) => ({
        OriginatingItemId: input.OriginatingItemId ?? null,
        Title: input.Title,
        Summary: input.Summary ?? null,
        ActualCompletionDate: input.ActualCompletionDate ?? null,
        NextTestDate: input.NextTestDate ?? null,
        StartDate: input.StartDate ?? null,
        TargetCompletionDate: input.TargetCompletionDate ?? null,
        CompletedByUser: input.CompletedByUser ?? null,
        Status: input.Status,
        Outcome: input.Outcome ?? null,
        CustomAttributeData: input.CustomAttributeData ?? null,
        OwnerUserIds: input.OwnerUserIds ?? [],
        OwnerGroupIds: input.OwnerGroupIds ?? [],
        ContributorUserIds: input.ContributorUserIds ?? [],
        ContributorGroupIds: input.ContributorGroupIds ?? [],
        TagTypeIds: input.TagTypeIds ?? [],
        DepartmentTypeIds: input.DepartmentTypeIds ?? [],
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createAssessment(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to create assessments',
      },
    });
  }

  async updateAssessment(ctx: ServiceContext, input: UpdateAssessmentRequest) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'UPDATE_ASSESSMENT',
      successStatus: 200,
      buildRequestBody: (input) => ({
        Id: input.Id,
        Title: input.Title,
        Summary: input.Summary ?? null,
        ActualCompletionDate: input.ActualCompletionDate ?? null,
        NextTestDate: input.NextTestDate ?? null,
        StartDate: input.StartDate ?? null,
        TargetCompletionDate: input.TargetCompletionDate ?? null,
        CompletedByUser: input.CompletedByUser ?? null,
        Status: input.Status,
        Outcome: input.Outcome ?? null,
        CustomAttributeData: input.CustomAttributeData ?? null,
        OwnerUserIds: input.OwnerUserIds ?? [],
        OwnerGroupIds: input.OwnerGroupIds ?? [],
        ContributorUserIds: input.ContributorUserIds ?? [],
        ContributorGroupIds: input.ContributorGroupIds ?? [],
        TagTypeIds: input.TagTypeIds ?? [],
        DepartmentTypeIds: input.DepartmentTypeIds ?? [],
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.updateAssessment(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to update this assessment',
        404: 'Assessment not found',
      },
    });
  }
}
