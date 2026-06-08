import { AssessmentStatus } from '@risksmart-app/domain/src/types/consts/assessment-status';
import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createCallerFactory } from '../../init';
import { createAssessmentService } from '../../services/frontend/index';
import { createMockContext } from '../../test-utils/mock-context';
import { assessmentRouter } from './assessment.router';

vi.mock('@sentry/node', () => ({
  trpcMiddleware: () => (opts: { next: () => unknown }) => opts.next(),
}));

vi.mock('@risksmart-app/permitio/src/permit', () => ({
  filter: vi.fn(),
  preFilter: vi.fn(),
}));

vi.mock('../../services/frontend/index');

const mockInsertAssessment = vi.fn();
const mockUpdateAssessment = vi.fn();
const mockDeleteAssessment = vi.fn();

const mockContext = createMockContext({
  orgId: 'test-org-id',
  userId: 'test-user-id',
  tenant: 'test-tenant',
  isBackend: false,
  features: [],
});

const createCaller = createCallerFactory(assessmentRouter);

describe('assessmentRouter.insert', () => {
  beforeEach(() => {
    vi.mocked(createAssessmentService).mockReturnValue({
      getAssessmentsRegister: vi.fn(),
      getAssessmentActivitiesRegister: vi.fn(),
      getAssessmentResultsRegister: vi.fn(),
      getAssessmentResultParentById: vi.fn(),
      getRiskAssessmentResultsByRiskId: vi.fn(),
      getAssessmentActivitiesByParentId: vi.fn(),
      getAssessmentById: vi.fn(),
      getAssessmentRCSAActivitiesByAssessmentId: vi.fn(),
      getLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId:
        vi.fn(),
      getLatestInternalAuditReportRiskAssessmentResultsByRiskId: vi.fn(),
      getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId: vi.fn(),
      getInternalAuditReportRiskAssessmentResultsByRiskId: vi.fn(),
      getLatestDocumentAssessmentResultByDocumentId: vi.fn(),
      getDocumentAssessmentResultsByParentId: vi.fn(),
      insertAssessment: mockInsertAssessment,
      updateAssessment: mockUpdateAssessment,
      deleteAssessment: mockDeleteAssessment,
    });
  });

  describe('input validation', () => {
    const insertSchema = z.object({
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
    });

    it('accepts required fields only (Title + Status)', () => {
      const result = insertSchema.safeParse({
        Title: 'Test Assessment',
        Status: AssessmentStatus.NotStarted,
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty Title', () => {
      const result = insertSchema.safeParse({
        Title: '',
        Status: AssessmentStatus.NotStarted,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes('Title'))).toBe(
          true
        );
      }
    });

    it('rejects invalid UUID for OriginatingItemId', () => {
      const result = insertSchema.safeParse({
        Title: 'Test Assessment',
        Status: AssessmentStatus.NotStarted,
        OriginatingItemId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some((e) => e.path.includes('OriginatingItemId'))
        ).toBe(true);
      }
    });

    it('accepts all optional fields including null values', () => {
      const result = insertSchema.safeParse({
        Title: 'Full Assessment',
        Status: AssessmentStatus.InProgress,
        OriginatingItemId: '123e4567-e89b-12d3-a456-426614174000',
        Summary: 'A summary',
        ActualCompletionDate: '2026-01-01',
        NextTestDate: '2026-06-01',
        StartDate: '2026-01-01',
        TargetCompletionDate: '2026-03-01',
        CompletedByUser: 'user@example.com',
        Outcome: 1,
        CustomAttributeData: { key: 'value' },
        OwnerUserIds: ['user1'],
        OwnerGroupIds: ['123e4567-e89b-12d3-a456-426614174000'],
        ContributorUserIds: ['user2'],
        ContributorGroupIds: ['123e4567-e89b-12d3-a456-426614174000'],
        TagTypeIds: ['123e4567-e89b-12d3-a456-426614174000'],
        DepartmentTypeIds: ['123e4567-e89b-12d3-a456-426614174000'],
      });
      expect(result.success).toBe(true);
    });

    it('accepts null for optional fields (form default values)', () => {
      const result = insertSchema.safeParse({
        Title: 'Test Assessment',
        Status: AssessmentStatus.NotStarted,
        OriginatingItemId: null,
        Summary: null,
        ActualCompletionDate: null,
        NextTestDate: null,
        StartDate: null,
        TargetCompletionDate: null,
        CompletedByUser: null,
        Outcome: null,
        CustomAttributeData: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('mutation', () => {
    it('calls insertAssessment with correct context and input', async () => {
      const mockResponse = { Id: 'new-assessment-id' };
      mockInsertAssessment.mockResolvedValueOnce(mockResponse);

      const caller = createCaller(mockContext);
      const result = await caller.insert({
        Title: 'Test Assessment',
        Status: AssessmentStatus.NotStarted,
      });

      expect(mockInsertAssessment).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          userId: 'test-user-id',
          tenant: 'test-tenant',
        },
        expect.objectContaining({
          Title: 'Test Assessment',
          Status: AssessmentStatus.NotStarted,
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('passes all optional fields through to the service', async () => {
      const mockResponse = { Id: 'new-assessment-id' };
      mockInsertAssessment.mockResolvedValueOnce(mockResponse);

      const caller = createCaller(mockContext);
      await caller.insert({
        Title: 'Full Assessment',
        Status: AssessmentStatus.InProgress,
        OriginatingItemId: '123e4567-e89b-12d3-a456-426614174000',
        Summary: 'A summary',
        ActualCompletionDate: '2026-01-01',
        NextTestDate: '2026-06-01',
        StartDate: '2026-01-01',
        TargetCompletionDate: '2026-03-01',
        CompletedByUser: 'user@example.com',
        Outcome: 1,
        CustomAttributeData: { key: 'value' },
        OwnerUserIds: ['user1'],
        OwnerGroupIds: ['123e4567-e89b-12d3-a456-426614174000'],
        ContributorUserIds: ['user2'],
        ContributorGroupIds: ['123e4567-e89b-12d3-a456-426614174000'],
        TagTypeIds: ['123e4567-e89b-12d3-a456-426614174000'],
        DepartmentTypeIds: ['123e4567-e89b-12d3-a456-426614174000'],
      });

      expect(mockInsertAssessment).toHaveBeenCalledWith(expect.any(Object), {
        Title: 'Full Assessment',
        Status: AssessmentStatus.InProgress,
        OriginatingItemId: '123e4567-e89b-12d3-a456-426614174000',
        Summary: 'A summary',
        ActualCompletionDate: '2026-01-01',
        NextTestDate: '2026-06-01',
        StartDate: '2026-01-01',
        TargetCompletionDate: '2026-03-01',
        CompletedByUser: 'user@example.com',
        Outcome: 1,
        CustomAttributeData: { key: 'value' },
        OwnerUserIds: ['user1'],
        OwnerGroupIds: ['123e4567-e89b-12d3-a456-426614174000'],
        ContributorUserIds: ['user2'],
        ContributorGroupIds: ['123e4567-e89b-12d3-a456-426614174000'],
        TagTypeIds: ['123e4567-e89b-12d3-a456-426614174000'],
        DepartmentTypeIds: ['123e4567-e89b-12d3-a456-426614174000'],
      });
    });

    it('propagates TRPCError from service (e.g. 403 permission denied)', async () => {
      mockInsertAssessment.mockRejectedValueOnce(
        new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create assessments',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.insert({
          Title: 'Test Assessment',
          Status: AssessmentStatus.NotStarted,
        })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: 'You do not have permission to create assessments',
      });
    });

    it('throws UNAUTHORIZED when user context is missing', async () => {
      const unauthCaller = createCaller(createMockContext(null));

      await expect(
        unauthCaller.insert({
          Title: 'Test Assessment',
          Status: AssessmentStatus.NotStarted,
        })
      ).rejects.toThrow(TRPCError);
    });
  });
});

describe('assessmentRouter.update', () => {
  beforeEach(() => {
    vi.mocked(createAssessmentService).mockReturnValue({
      getAssessmentsRegister: vi.fn(),
      getAssessmentActivitiesRegister: vi.fn(),
      getAssessmentResultsRegister: vi.fn(),
      getAssessmentResultParentById: vi.fn(),
      getRiskAssessmentResultsByRiskId: vi.fn(),
      getAssessmentActivitiesByParentId: vi.fn(),
      getAssessmentById: vi.fn(),
      getAssessmentRCSAActivitiesByAssessmentId: vi.fn(),
      getLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId:
        vi.fn(),
      getLatestInternalAuditReportRiskAssessmentResultsByRiskId: vi.fn(),
      getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId: vi.fn(),
      getInternalAuditReportRiskAssessmentResultsByRiskId: vi.fn(),
      getLatestDocumentAssessmentResultByDocumentId: vi.fn(),
      getDocumentAssessmentResultsByParentId: vi.fn(),
      insertAssessment: mockInsertAssessment,
      updateAssessment: mockUpdateAssessment,
      deleteAssessment: mockDeleteAssessment,
    });
  });

  describe('input validation', () => {
    const updateSchema = z.object({
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
    });

    it('accepts required fields (Id + Title + Status)', () => {
      const result = updateSchema.safeParse({
        Id: '123e4567-e89b-12d3-a456-426614174000',
        Title: 'Test Assessment',
        Status: AssessmentStatus.NotStarted,
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty Title', () => {
      const result = updateSchema.safeParse({
        Id: '123e4567-e89b-12d3-a456-426614174000',
        Title: '',
        Status: AssessmentStatus.NotStarted,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes('Title'))).toBe(
          true
        );
      }
    });

    it('rejects invalid UUID for Id', () => {
      const result = updateSchema.safeParse({
        Id: 'not-a-uuid',
        Title: 'Test Assessment',
        Status: AssessmentStatus.NotStarted,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes('Id'))).toBe(
          true
        );
      }
    });

    it('accepts all optional fields including null values', () => {
      const result = updateSchema.safeParse({
        Id: '123e4567-e89b-12d3-a456-426614174000',
        Title: 'Full Assessment',
        Status: AssessmentStatus.Complete,
        Summary: null,
        ActualCompletionDate: null,
        NextTestDate: null,
        StartDate: null,
        TargetCompletionDate: null,
        CompletedByUser: null,
        Outcome: null,
        CustomAttributeData: null,
        OwnerUserIds: ['user1'],
        OwnerGroupIds: ['123e4567-e89b-12d3-a456-426614174000'],
        ContributorUserIds: ['user2'],
        ContributorGroupIds: ['123e4567-e89b-12d3-a456-426614174000'],
        TagTypeIds: ['123e4567-e89b-12d3-a456-426614174000'],
        DepartmentTypeIds: ['123e4567-e89b-12d3-a456-426614174000'],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('mutation', () => {
    it('calls updateAssessment with correct context and input', async () => {
      const mockResponse = { Id: '123e4567-e89b-12d3-a456-426614174000' };
      mockUpdateAssessment.mockResolvedValueOnce(mockResponse);

      const caller = createCaller(mockContext);
      const result = await caller.update({
        Id: '123e4567-e89b-12d3-a456-426614174000',
        Title: 'Updated Assessment',
        Status: AssessmentStatus.InProgress,
      });

      expect(mockUpdateAssessment).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          userId: 'test-user-id',
          tenant: 'test-tenant',
        },
        expect.objectContaining({
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Updated Assessment',
          Status: AssessmentStatus.InProgress,
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('propagates TRPCError from service (e.g. 403 permission denied)', async () => {
      mockUpdateAssessment.mockRejectedValueOnce(
        new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update assessments',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.update({
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Assessment',
          Status: AssessmentStatus.NotStarted,
        })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: 'You do not have permission to update assessments',
      });
    });

    it('propagates TRPCError from service (e.g. 404 not found)', async () => {
      mockUpdateAssessment.mockRejectedValueOnce(
        new TRPCError({
          code: 'NOT_FOUND',
          message: 'Assessment not found',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.update({
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Assessment',
          Status: AssessmentStatus.NotStarted,
        })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Assessment not found',
      });
    });
  });
});

describe('assessmentRouter.delete', () => {
  beforeEach(() => {
    vi.mocked(createAssessmentService).mockReturnValue({
      getAssessmentsRegister: vi.fn(),
      getAssessmentActivitiesRegister: vi.fn(),
      getAssessmentResultsRegister: vi.fn(),
      getAssessmentResultParentById: vi.fn(),
      getRiskAssessmentResultsByRiskId: vi.fn(),
      getAssessmentActivitiesByParentId: vi.fn(),
      getAssessmentById: vi.fn(),
      getAssessmentRCSAActivitiesByAssessmentId: vi.fn(),
      getLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId:
        vi.fn(),
      getLatestInternalAuditReportRiskAssessmentResultsByRiskId: vi.fn(),
      getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId: vi.fn(),
      getInternalAuditReportRiskAssessmentResultsByRiskId: vi.fn(),
      getLatestDocumentAssessmentResultByDocumentId: vi.fn(),
      getDocumentAssessmentResultsByParentId: vi.fn(),
      insertAssessment: mockInsertAssessment,
      updateAssessment: mockUpdateAssessment,
      deleteAssessment: mockDeleteAssessment,
    });
  });

  describe('input validation', () => {
    const deleteSchema = z.object({ id: z.string().uuid() });

    it('accepts valid UUID id', () => {
      const result = deleteSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid UUID id', () => {
      const result = deleteSchema.safeParse({ id: 'not-a-uuid' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes('id'))).toBe(
          true
        );
      }
    });
  });

  describe('mutation', () => {
    it('calls deleteAssessment with correct context and id', async () => {
      mockDeleteAssessment.mockResolvedValueOnce(undefined);

      const caller = createCaller(mockContext);
      await caller.delete({
        id: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(mockDeleteAssessment).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          userId: 'test-user-id',
          tenant: 'test-tenant',
        },
        '123e4567-e89b-12d3-a456-426614174000'
      );
    });

    it('propagates TRPCError from service (e.g. 403 permission denied)', async () => {
      mockDeleteAssessment.mockRejectedValueOnce(
        new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete assessments',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.delete({ id: '123e4567-e89b-12d3-a456-426614174000' })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: 'You do not have permission to delete assessments',
      });
    });

    it('propagates TRPCError from service (e.g. 404 not found)', async () => {
      mockDeleteAssessment.mockRejectedValueOnce(
        new TRPCError({
          code: 'NOT_FOUND',
          message: 'Assessment not found',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.delete({ id: '123e4567-e89b-12d3-a456-426614174000' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Assessment not found',
      });
    });

    it('throws UNAUTHORIZED when user context is missing', async () => {
      const unauthCaller = createCaller(createMockContext(null));

      await expect(
        unauthCaller.delete({ id: '123e4567-e89b-12d3-a456-426614174000' })
      ).rejects.toThrow(TRPCError);
    });
  });
});
