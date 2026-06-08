import { AssessmentStatus } from '@risksmart-app/domain/src/types/consts/assessment-status';
import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createAssessmentService } from '../../services/frontend/index';
export const assessmentRouter = router({
  register: authedProcedure.query(async (req) => {
    const assessmentService = createAssessmentService();

    return assessmentService.getAssessmentsRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
  getById: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async (req) => {
      const assessmentService = createAssessmentService();

      return assessmentService.getAssessmentById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
  activityRegister: authedProcedure.query(async (req) => {
    const assessmentService = createAssessmentService();

    return assessmentService.getAssessmentActivitiesRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
  resultParents: {
    getById: authedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async (req) => {
        const assessmentService = createAssessmentService();

        return assessmentService.getAssessmentResultParentById(
          {
            orgId: req.ctx.user.orgId,
            tenant: req.ctx.user.tenant,
            userId: req.ctx.user.userId,
          },
          req.input.id
        );
      }),
  },

  assessmentActivitiesByParentId: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async (req) => {
      const assessmentService = createAssessmentService();

      return assessmentService.getAssessmentActivitiesByParentId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),

  resultsRegister: authedProcedure.query(async (req) => {
    const assessmentService = createAssessmentService();

    return assessmentService.getAssessmentResultsRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),

  riskAssessmentResultsByRiskId: authedProcedure
    .input(z.object({ riskId: z.string().uuid() }))
    .query(async (req) => {
      const assessmentService = createAssessmentService();

      return assessmentService.getRiskAssessmentResultsByRiskId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.riskId
      );
    }),

  assessmentRCSAActivitiesByAssessmentId: authedProcedure
    .input(z.object({ assessmentId: z.string().uuid() }))
    .query(async (req) => {
      const assessmentService = createAssessmentService();

      return assessmentService.getAssessmentRCSAActivitiesByAssessmentId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.assessmentId
      );
    }),

  latestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId:
    authedProcedure
      .input(
        z.object({
          riskId: z.string().uuid(),
        })
      )
      .query(async (req) => {
        const assessmentService = createAssessmentService();

        return assessmentService.getLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId(
          {
            orgId: req.ctx.user.orgId,
            tenant: req.ctx.user.tenant,
            userId: req.ctx.user.userId,
          },
          req.input.riskId
        );
      }),

  latestInternalAuditReportRiskAssessmentResultsByRiskId: authedProcedure
    .input(
      z.object({
        riskId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const assessmentService = createAssessmentService();

      return assessmentService.getLatestInternalAuditReportRiskAssessmentResultsByRiskId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.riskId
      );
    }),

  internalAuditReportRiskAssessmentResultsByRiskId: authedProcedure
    .input(
      z.object({
        riskId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const assessmentService = createAssessmentService();

      return assessmentService.getInternalAuditReportRiskAssessmentResultsByRiskId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.riskId
      );
    }),

  complianceMonitoringAssessmentRiskAssessmentResultsByRiskId: authedProcedure
    .input(
      z.object({
        riskId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const assessmentService = createAssessmentService();

      return assessmentService.getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.riskId
      );
    }),

  latestDocumentAssessmentResultByDocumentId: authedProcedure
    .input(
      z.object({
        documentId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const assessmentService = createAssessmentService();

      return assessmentService.getLatestDocumentAssessmentResultByDocumentId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.documentId
      );
    }),

  documentAssessmentResultsByParentId: authedProcedure
    .input(
      z.object({
        parentId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const assessmentService = createAssessmentService();

      return assessmentService.getDocumentAssessmentResultsByParentId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.parentId
      );
    }),

  update: authedProcedure
    .input(
      z.object({
        Id: z.string().uuid(),
        Title: z.string().min(1),
        Summary: z.string().nullable().optional(),
        ActualCompletionDate: z.string().nullable().optional(),
        NextTestDate: z.string().nullable().optional(),
        StartDate: z.string().nullable().optional(),
        TargetCompletionDate: z.string().nullable().optional(),
        CompletedByUser: z.string().nullable().optional(),
        Status: z.nativeEnum(AssessmentStatus),
        Outcome: z.number().int().nullable().optional(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
        OwnerUserIds: z.array(z.string()).optional(),
        OwnerGroupIds: z.array(z.string().uuid()).optional(),
        ContributorUserIds: z.array(z.string()).optional(),
        ContributorGroupIds: z.array(z.string().uuid()).optional(),
        TagTypeIds: z.array(z.string().uuid()).optional(),
        DepartmentTypeIds: z.array(z.string().uuid()).optional(),
      })
    )
    .mutation(async (req) => {
      const assessmentService = createAssessmentService();

      return assessmentService.updateAssessment(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input
      );
    }),

  insert: authedProcedure
    .input(
      z.object({
        OriginatingItemId: z.string().uuid().nullable().optional(),
        Title: z.string().min(1),
        Summary: z.string().nullable().optional(),
        ActualCompletionDate: z.string().nullable().optional(),
        NextTestDate: z.string().nullable().optional(),
        StartDate: z.string().nullable().optional(),
        TargetCompletionDate: z.string().nullable().optional(),
        CompletedByUser: z.string().nullable().optional(),
        Status: z.nativeEnum(AssessmentStatus),
        Outcome: z.number().int().nullable().optional(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
        OwnerUserIds: z.array(z.string()).optional(),
        OwnerGroupIds: z.array(z.string().uuid()).optional(),
        ContributorUserIds: z.array(z.string()).optional(),
        ContributorGroupIds: z.array(z.string().uuid()).optional(),
        TagTypeIds: z.array(z.string().uuid()).optional(),
        DepartmentTypeIds: z.array(z.string().uuid()).optional(),
      })
    )
    .mutation(async (req) => {
      const assessmentService = createAssessmentService();

      return assessmentService.insertAssessment(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input
      );
    }),
  delete: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async (req) => {
      const assessmentService = createAssessmentService();

      return assessmentService.deleteAssessment(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
});
