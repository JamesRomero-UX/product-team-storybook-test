import { TestType } from '@risksmart-app/domain/src/types/consts/test-type';
import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createTestResultService } from '../../services/frontend/index';
import { logger } from '../../utils/logger';

export const testResultRouter = router({
  testResults: authedProcedure.query(async (req) => {
    const testResultService = createTestResultService();
    logger.debug(req.ctx.user, 'Fetching test results');

    return testResultService.getTestResults({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),

  testResultById: authedProcedure
    .input(
      z.object({
        testResultId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const testResultService = createTestResultService();
      logger.debug(
        {
          ...req.ctx.user,
          testResultId: req.input.testResultId,
        },
        'Fetching test result by id'
      );

      return testResultService.getTestResultById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.testResultId
      );
    }),

  latestTestResultsByControlId: authedProcedure
    .input(
      z.object({
        controlId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const testResultService = createTestResultService();
      logger.debug(
        {
          userId: req.ctx.user.userId,
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          controlId: req.input.controlId,
        },
        'Fetching latest test results by control id'
      );

      return testResultService.getLatestTestResultsByControlId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.controlId
      );
    }),

  latestInternalAuditReportTestResultsByControlId: authedProcedure
    .input(
      z.object({
        controlId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const testResultService = createTestResultService();
      logger.debug(
        {
          userId: req.ctx.user.userId,
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          controlId: req.input.controlId,
        },
        'Fetching latest internal audit report test results by control id'
      );

      return testResultService.getLatestInternalAuditReportTestResultsByControlId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.controlId
      );
    }),

  latestComplianceMonitoringAssessmentTestResultsByControlId: authedProcedure
    .input(
      z.object({
        controlId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const testResultService = createTestResultService();
      logger.debug(
        {
          userId: req.ctx.user.userId,
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          controlId: req.input.controlId,
        },
        'Fetching latest compliance monitoring assessment test results by control id'
      );

      return testResultService.getLatestComplianceMonitoringAssessmentTestResultsByControlId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.controlId
      );
    }),

  testResultsByControlId: authedProcedure
    .input(
      z.object({
        controlId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const testResultService = createTestResultService();
      logger.debug(
        {
          userId: req.ctx.user.userId,
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          controlId: req.input.controlId,
        },
        'Fetching test results by control id'
      );

      return testResultService.getTestResultsByControlId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.controlId
      );
    }),

  internalAuditReportTestResultsByControlId: authedProcedure
    .input(
      z.object({
        controlId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const testResultService = createTestResultService();
      logger.debug(
        {
          userId: req.ctx.user.userId,
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          controlId: req.input.controlId,
        },
        'Fetching internal audit report test results by control id'
      );

      return testResultService.getInternalAuditReportTestResultsByControlId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.controlId
      );
    }),

  complianceMonitoringAssessmentTestResultsByControlId: authedProcedure
    .input(
      z.object({
        controlId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const testResultService = createTestResultService();
      logger.debug(
        {
          userId: req.ctx.user.userId,
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          controlId: req.input.controlId,
        },
        'Fetching compliance monitoring assessment test results by control id'
      );

      return testResultService.getComplianceMonitoringAssessmentTestResultsByControlId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.controlId
      );
    }),

  insert: authedProcedure
    .input(
      z.object({
        ControlIds: z.array(z.string().uuid()).min(1),
        AssessmentId: z.string().uuid().nullable().optional(),
        Description: z.string().nullable().optional(),
        DesignEffectiveness: z
          .number()
          .int()
          .min(0)
          .max(4)
          .nullable()
          .optional(),
        OverallEffectiveness: z
          .number()
          .int()
          .min(0)
          .max(4)
          .nullable()
          .optional(),
        PerformanceEffectiveness: z
          .number()
          .int()
          .min(0)
          .max(4)
          .nullable()
          .optional(),
        Submitter: z.string().nullable().optional(),
        TestDate: z.string().nullable().optional(),
        TestType: z.nativeEnum(TestType).nullable().optional(),
        Title: z.string().nullable().optional(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
      })
    )
    .mutation(async (req) => {
      const testResultService = createTestResultService();

      return testResultService.insertControlTestResult(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input
      );
    }),

  update: authedProcedure
    .input(
      z.object({
        Id: z.string().uuid(),
        ParentControlId: z.string().uuid(),
        Description: z.string().nullable().optional(),
        DesignEffectiveness: z
          .number()
          .int()
          .min(0)
          .max(4)
          .nullable()
          .optional(),
        OverallEffectiveness: z
          .number()
          .int()
          .min(0)
          .max(4)
          .nullable()
          .optional(),
        PerformanceEffectiveness: z
          .number()
          .int()
          .min(0)
          .max(4)
          .nullable()
          .optional(),
        Submitter: z.string().nullable().optional(),
        TestDate: z.string().nullable().optional(),
        TestType: z.nativeEnum(TestType).nullable().optional(),
        Title: z.string().nullable().optional(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
        OriginalTimestamp: z.string(),
      })
    )
    .mutation(async (req) => {
      const testResultService = createTestResultService();

      return testResultService.updateTestResult(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input
      );
    }),

  delete: authedProcedure
    .input(
      z.object({
        ids: z
          .array(z.string().uuid())
          .min(1, 'At least one ID is required')
          .max(200, 'Maximum 200 IDs allowed per request'),
      })
    )
    .mutation(async (req) => {
      const testResultService = createTestResultService();

      return testResultService.deleteTestResults(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.ids
      );
    }),
});
