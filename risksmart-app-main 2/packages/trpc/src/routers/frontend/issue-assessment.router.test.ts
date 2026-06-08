import { IssueAssessmentStatus } from '@risksmart-app/domain/src/types';
import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createCallerFactory } from '../../init';
import { createIssueAssessmentService } from '../../services/frontend/index';
import { createMockContext } from '../../test-utils/mock-context';
import { issueAssessmentRouter } from './issue-assessment.router';

vi.mock('@sentry/node', () => ({
  trpcMiddleware: () => (opts: { next: () => unknown }) => opts.next(),
}));

vi.mock('@risksmart-app/permitio/src/permit', () => ({
  filter: vi.fn(),
  preFilter: vi.fn(),
}));

vi.mock('../../services/frontend/index');

const mockInsertIssueAssessment = vi.fn();

const mockContext = createMockContext({
  orgId: 'test-org-id',
  userId: 'test-user-id',
  tenant: 'test-tenant',
  isBackend: false,
  features: [],
});

const createCaller = createCallerFactory(issueAssessmentRouter);

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('issueAssessmentRouter.insert', () => {
  beforeEach(() => {
    vi.mocked(createIssueAssessmentService).mockReturnValue({
      insertIssueAssessment: mockInsertIssueAssessment,
    });
  });

  describe('input validation', () => {
    const insertSchema = z.object({
      ParentIssueId: z.string().uuid(),
      Severity: z.number().nullable().optional(),
      Status: z.string().nullable().optional(),
      CertifiedIndividual: z.string().nullable().optional(),
      IssueType: z.string().nullable().optional(),
      ActualCloseDate: z.string().nullable().optional(),
      TargetCloseDate: z.string().nullable().optional(),
      PolicyOwnerCommentary: z.string().nullable().optional(),
      PolicyOwner: z.string().nullable().optional(),
      PolicyBreach: z.boolean().nullable().optional(),
      Reportable: z.boolean().nullable().optional(),
      PoliciesBreached: z.string().nullable().optional(),
      Rationale: z.string().nullable().optional(),
      IssueCausedByThirdParty: z.boolean().nullable().optional(),
      SystemResponsible: z.string().nullable().optional(),
      RegulatoryBreach: z.boolean().nullable().optional(),
      RegulationsBreached: z.string().nullable().optional(),
      ThirdPartyResponsible: z.string().nullable().optional(),
      IssueCausedBySystemIssue: z.boolean().nullable().optional(),
      CustomAttributeData: z
        .record(z.string(), z.unknown())
        .nullable()
        .optional(),
      TagTypeIds: z.array(z.string().uuid()).optional(),
      DepartmentTypeIds: z.array(z.string().uuid()).optional(),
      RegulationsBreachedIds: z.array(z.string().uuid()).optional(),
      AssociatedControlIds: z.array(z.string().uuid()).optional(),
      PoliciesBreachedIds: z.array(z.string().uuid()).optional(),
    });

    it('accepts required fields only', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: VALID_UUID,
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing ParentIssueId', () => {
      const result = insertSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some((e) => e.path.includes('ParentIssueId'))
        ).toBe(true);
      }
    });

    it('rejects invalid UUID for ParentIssueId', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some((e) => e.path.includes('ParentIssueId'))
        ).toBe(true);
      }
    });

    it('accepts all optional scalar fields', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: VALID_UUID,
        Severity: 3,
        Status: 'open',
        CertifiedIndividual: 'user-123',
        IssueType: 'type-1',
        ActualCloseDate: '2025-01-01T00:00:00Z',
        TargetCloseDate: '2025-06-01T00:00:00Z',
        PolicyOwnerCommentary: 'Commentary',
        PolicyOwner: 'owner-123',
        PolicyBreach: true,
        Reportable: false,
        PoliciesBreached: 'Policy A',
        Rationale: 'Some rationale',
        IssueCausedByThirdParty: false,
        SystemResponsible: 'System A',
        RegulatoryBreach: true,
        RegulationsBreached: 'Regulation A',
        ThirdPartyResponsible: 'Third party',
        IssueCausedBySystemIssue: false,
        CustomAttributeData: { key: 'value' },
      });
      expect(result.success).toBe(true);
    });

    it('accepts null for all optional fields', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: VALID_UUID,
        Severity: null,
        Status: null,
        CertifiedIndividual: null,
        IssueType: null,
        ActualCloseDate: null,
        TargetCloseDate: null,
        PolicyOwnerCommentary: null,
        PolicyOwner: null,
        PolicyBreach: null,
        Reportable: null,
        PoliciesBreached: null,
        Rationale: null,
        IssueCausedByThirdParty: null,
        SystemResponsible: null,
        RegulatoryBreach: null,
        RegulationsBreached: null,
        ThirdPartyResponsible: null,
        IssueCausedBySystemIssue: null,
        CustomAttributeData: null,
      });
      expect(result.success).toBe(true);
    });

    it('accepts array fields', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: VALID_UUID,
        TagTypeIds: [VALID_UUID],
        DepartmentTypeIds: [VALID_UUID],
        RegulationsBreachedIds: [VALID_UUID],
        AssociatedControlIds: [VALID_UUID],
        PoliciesBreachedIds: [VALID_UUID],
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid UUID in array fields', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: VALID_UUID,
        TagTypeIds: ['not-a-uuid'],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('mutation', () => {
    it('calls insertIssueAssessment with correct context and required fields', async () => {
      const mockResponse = { Id: 'new-assessment-id' };
      mockInsertIssueAssessment.mockResolvedValueOnce(mockResponse);

      const caller = createCaller(mockContext);
      const result = await caller.insert({
        ParentIssueId: VALID_UUID,
      });

      expect(mockInsertIssueAssessment).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          userId: 'test-user-id',
          tenant: 'test-tenant',
        },
        expect.objectContaining({
          ParentIssueId: VALID_UUID,
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('passes all optional fields through to the service', async () => {
      const mockResponse = { Id: 'new-assessment-id' };
      mockInsertIssueAssessment.mockResolvedValueOnce(mockResponse);

      const caller = createCaller(mockContext);
      await caller.insert({
        ParentIssueId: VALID_UUID,
        Severity: 5,
        Status: IssueAssessmentStatus.Open,
        PolicyBreach: true,
        PoliciesBreached: 'Policy A',
        TagTypeIds: [VALID_UUID],
        DepartmentTypeIds: [VALID_UUID],
        RegulationsBreachedIds: [VALID_UUID],
        AssociatedControlIds: [VALID_UUID],
        PoliciesBreachedIds: [VALID_UUID],
      });

      expect(mockInsertIssueAssessment).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          ParentIssueId: VALID_UUID,
          Severity: 5,
          Status: 'open',
          PolicyBreach: true,
          PoliciesBreached: 'Policy A',
          TagTypeIds: [VALID_UUID],
          DepartmentTypeIds: [VALID_UUID],
          RegulationsBreachedIds: [VALID_UUID],
          AssociatedControlIds: [VALID_UUID],
          PoliciesBreachedIds: [VALID_UUID],
        })
      );
    });

    it('propagates TRPCError from service (403 permission denied)', async () => {
      mockInsertIssueAssessment.mockRejectedValueOnce(
        new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create issue assessments',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.insert({ ParentIssueId: VALID_UUID })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: 'You do not have permission to create issue assessments',
      });
    });

    it('propagates TRPCError from service (404 parent not found)', async () => {
      mockInsertIssueAssessment.mockRejectedValueOnce(
        new TRPCError({
          code: 'NOT_FOUND',
          message: 'Parent issue not found',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.insert({ ParentIssueId: VALID_UUID })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Parent issue not found',
      });
    });

    it('throws UNAUTHORIZED when user context is missing', async () => {
      const unauthCaller = createCaller(createMockContext(null));

      await expect(
        unauthCaller.insert({ ParentIssueId: VALID_UUID })
      ).rejects.toThrow(TRPCError);
    });
  });
});
