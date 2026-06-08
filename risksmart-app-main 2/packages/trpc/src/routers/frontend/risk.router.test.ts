import { RiskStatusType } from '@risksmart-app/domain/src/types/consts/risk-status-type';
import { RiskTreatmentType } from '@risksmart-app/domain/src/types/consts/risk-treatment-type';
import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createCallerFactory } from '../../init';
import { createRiskService } from '../../services/frontend/index';
import { createMockContext } from '../../test-utils/mock-context';
import { riskRouter } from './risk.router';

vi.mock('@sentry/node', () => ({
  trpcMiddleware: () => (opts: { next: () => unknown }) => opts.next(),
}));

vi.mock('@risksmart-app/permitio/src/permit', () => ({
  filter: vi.fn(),
  preFilter: vi.fn(),
}));

vi.mock('../../services/frontend/index');

const mockInsertRisk = vi.fn();

const mockContext = createMockContext({
  orgId: 'test-org-id',
  userId: 'test-user-id',
  tenant: 'test-tenant',
  isBackend: false,
  features: [],
});

const createCaller = createCallerFactory(riskRouter);

describe('riskRouter.insert', () => {
  beforeEach(() => {
    vi.mocked(createRiskService).mockReturnValue({
      insertRisk: mockInsertRisk,
      updateRisk: vi.fn(),
      getRiskById: vi.fn(),
      getRisksRegister: vi.fn(),
      getRiskScores: vi.fn(),
      getRiskListOnlyOptimized: vi.fn(),
      getRiskListOnlyWithEntitiesOptimized: vi.fn(),
      getRiskScoresByRiskId: vi.fn(),
      deleteRisk: vi.fn(),
    });
  });

  describe('input validation', () => {
    // Test the schema in isolation via safeParse for clear error messages
    const insertSchema = z
      .object({
        ParentRiskId: z.string().uuid().nullable().optional(),
        Title: z.string().min(1),
        Tier: z.number().int(),
        Description: z.string().nullable().optional(),
        Treatment: z.nativeEnum(RiskTreatmentType).nullable().optional(),
        Status: z.nativeEnum(RiskStatusType).nullable().optional(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
      })
      .refine((data) => data.Tier <= 1 || data.ParentRiskId != null, {
        message: 'ParentRiskId is required when Tier is greater than 1',
      });

    it('accepts Tier 1 without ParentRiskId', () => {
      const result = insertSchema.safeParse({ Title: 'Test Risk', Tier: 1 });
      expect(result.success).toBe(true);
    });

    it('accepts Tier 1 with ParentRiskId', () => {
      const result = insertSchema.safeParse({
        Title: 'Test Risk',
        Tier: 1,
        ParentRiskId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
    });

    it('accepts Tier 2 with ParentRiskId', () => {
      const result = insertSchema.safeParse({
        Title: 'Child Risk',
        Tier: 2,
        ParentRiskId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
    });

    it('accepts Tier 3 with ParentRiskId', () => {
      const result = insertSchema.safeParse({
        Title: 'Grandchild Risk',
        Tier: 3,
        ParentRiskId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
    });

    it('rejects Tier 2 without ParentRiskId', () => {
      const result = insertSchema.safeParse({ Title: 'Test Risk', Tier: 2 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toBe(
          'ParentRiskId is required when Tier is greater than 1'
        );
      }
    });

    it('rejects Tier 2 with null ParentRiskId', () => {
      const result = insertSchema.safeParse({
        Title: 'Test Risk',
        Tier: 2,
        ParentRiskId: null,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toBe(
          'ParentRiskId is required when Tier is greater than 1'
        );
      }
    });

    it('rejects Tier 3 without ParentRiskId', () => {
      const result = insertSchema.safeParse({ Title: 'Test Risk', Tier: 3 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toBe(
          'ParentRiskId is required when Tier is greater than 1'
        );
      }
    });

    it('rejects empty Title', () => {
      const result = insertSchema.safeParse({ Title: '', Tier: 1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes('Title'))).toBe(
          true
        );
      }
    });

    it('rejects non-integer Tier', () => {
      const result = insertSchema.safeParse({ Title: 'Test', Tier: 1.5 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes('Tier'))).toBe(
          true
        );
      }
    });

    it('rejects invalid UUID for ParentRiskId', () => {
      const result = insertSchema.safeParse({
        Title: 'Test',
        Tier: 2,
        ParentRiskId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some((e) => e.path.includes('ParentRiskId'))
        ).toBe(true);
      }
    });

    it('accepts all optional fields', () => {
      const result = insertSchema.safeParse({
        Title: 'Full Risk',
        Tier: 1,
        Description: 'A description',
        Treatment: RiskTreatmentType.Treat,
        Status: RiskStatusType.Active,
        CustomAttributeData: { key: 'value' },
      });
      expect(result.success).toBe(true);
    });

    it('accepts null CustomAttributeData', () => {
      const result = insertSchema.safeParse({
        Title: 'Test',
        Tier: 1,
        CustomAttributeData: null,
      });
      expect(result.success).toBe(true);
    });

    it('accepts null for optional string fields (form default values)', () => {
      const result = insertSchema.safeParse({
        Title: 'Test Risk',
        Tier: 1,
        ParentRiskId: null,
        Description: null,
        Treatment: null,
        Status: null,
        CustomAttributeData: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('mutation', () => {
    it('calls insertRisk with correct context and required fields', async () => {
      const mockResponse = { Id: 'new-risk-id' };
      mockInsertRisk.mockResolvedValueOnce(mockResponse);

      const caller = createCaller(mockContext);
      const result = await caller.insert({ Title: 'Test Risk', Tier: 1 });

      expect(mockInsertRisk).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          userId: 'test-user-id',
          tenant: 'test-tenant',
        },
        expect.objectContaining({
          Title: 'Test Risk',
          Tier: 1,
          CustomAttributeData: null,
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('passes all optional fields through to the service', async () => {
      const mockResponse = { Id: 'new-risk-id' };
      mockInsertRisk.mockResolvedValueOnce(mockResponse);

      const caller = createCaller(mockContext);
      await caller.insert({
        Title: 'Child Risk',
        Tier: 2,
        ParentRiskId: '123e4567-e89b-12d3-a456-426614174000',
        Description: 'A description',
        Treatment: RiskTreatmentType.Treat,
        Status: RiskStatusType.Active,
        CustomAttributeData: { key: 'value' },
      });

      expect(mockInsertRisk).toHaveBeenCalledWith(expect.any(Object), {
        Title: 'Child Risk',
        Tier: 2,
        ParentRiskId: '123e4567-e89b-12d3-a456-426614174000',
        Description: 'A description',
        Treatment: RiskTreatmentType.Treat,
        Status: RiskStatusType.Active,
        CustomAttributeData: { key: 'value' },
      });
    });

    it('throws BAD_REQUEST when Tier > 1 and ParentRiskId is missing', async () => {
      const caller = createCaller(mockContext);
      await expect(
        caller.insert({ Title: 'Test Risk', Tier: 2 })
      ).rejects.toThrow(TRPCError);
    });

    it('propagates TRPCError from service (e.g. 403 permission denied)', async () => {
      mockInsertRisk.mockRejectedValueOnce(
        new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create risks',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.insert({ Title: 'Test Risk', Tier: 1 })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: 'You do not have permission to create risks',
      });
    });

    it('propagates TRPCError from service (e.g. 404 parent not found)', async () => {
      mockInsertRisk.mockRejectedValueOnce(
        new TRPCError({
          code: 'NOT_FOUND',
          message: 'Parent risk not found',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.insert({
          Title: 'Child Risk',
          Tier: 2,
          ParentRiskId: '123e4567-e89b-12d3-a456-426614174000',
        })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Parent risk not found',
      });
    });

    it('throws UNAUTHORIZED when user context is missing', async () => {
      const unauthCaller = createCaller(createMockContext(null));

      await expect(
        unauthCaller.insert({ Title: 'Test Risk', Tier: 1 })
      ).rejects.toThrow(TRPCError);
    });
  });
});
