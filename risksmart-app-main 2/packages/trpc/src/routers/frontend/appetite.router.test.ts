import { AppetiteType } from '@risksmart-app/domain/src/types/consts/index';
import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createCallerFactory } from '../../init';
import { createAppetiteService } from '../../services/frontend/index';
import { createMockContext } from '../../test-utils/mock-context';
import { appetiteRouter } from './appetite.router';

vi.mock('@sentry/node', () => ({
  trpcMiddleware: () => (opts: { next: () => unknown }) => opts.next(),
}));

vi.mock('@risksmart-app/permitio/src/permit', () => ({
  filter: vi.fn(),
  preFilter: vi.fn(),
}));

vi.mock('../../services/frontend/index');

const mockInsertAppetite = vi.fn();
const mockUpdateAppetite = vi.fn();
const mockDeleteAppetites = vi.fn();

const mockContext = createMockContext({
  orgId: 'test-org-id',
  userId: 'test-user-id',
  tenant: 'test-tenant',
  isBackend: false,
  features: [],
});

const createCaller = createCallerFactory(appetiteRouter);

const validParentId = '123e4567-e89b-12d3-a456-426614174000';
const validImpactId = '223e4567-e89b-12d3-a456-426614174001';

describe('appetiteRouter.insert', () => {
  beforeEach(() => {
    vi.mocked(createAppetiteService).mockReturnValue({
      insertAppetite: mockInsertAppetite,
      updateAppetite: mockUpdateAppetite,
      deleteAppetites: mockDeleteAppetites,
      getActiveAppetitesRegister: vi.fn(),
      getAppetitesByParentId: vi.fn(),
      getAppetiteById: vi.fn(),
      getActiveAppetitesByParentId: vi.fn(),
      getAppetitesGroupedByImpact: vi.fn(),
    });
  });

  describe('input validation', () => {
    const insertSchema = z
      .object({
        ParentIds: z.array(z.string().uuid()).min(1),
        Statement: z.string().nullish(),
        EffectiveDate: z.string().nullish(),
        CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
      })
      .and(
        z.discriminatedUnion('AppetiteType', [
          z.object({
            AppetiteType: z.literal(AppetiteType.Impact),
            ImpactAppetite: z.number().int(),
            ImpactId: z.string().uuid(),
          }),
          z.object({
            AppetiteType: z.literal(AppetiteType.Likelihood),
            LikelihoodAppetite: z.number().int().nullish(),
          }),
          z.object({
            AppetiteType: z.literal(AppetiteType.Risk),
            LowerAppetite: z.number().int().nullish(),
            UpperAppetite: z.number().int().nullish(),
          }),
        ])
      );

    it('accepts risk appetite with required fields only', () => {
      const result = insertSchema.safeParse({
        ParentIds: [validParentId],
        AppetiteType: AppetiteType.Risk,
      });
      expect(result.success).toBe(true);
    });

    it('accepts risk appetite with all optional fields', () => {
      const result = insertSchema.safeParse({
        ParentIds: [validParentId],
        AppetiteType: AppetiteType.Risk,
        LowerAppetite: 2,
        UpperAppetite: 4,
        Statement: 'Risk appetite statement',
        EffectiveDate: '2024-01-01T00:00:00Z',
        CustomAttributeData: { key: 'value' },
      });
      expect(result.success).toBe(true);
    });

    it('accepts impact appetite with required fields', () => {
      const result = insertSchema.safeParse({
        ParentIds: [validParentId],
        AppetiteType: AppetiteType.Impact,
        ImpactAppetite: 3,
        ImpactId: validImpactId,
      });
      expect(result.success).toBe(true);
    });

    it('accepts likelihood appetite with required fields', () => {
      const result = insertSchema.safeParse({
        ParentIds: [validParentId],
        AppetiteType: AppetiteType.Likelihood,
      });
      expect(result.success).toBe(true);
    });

    it('accepts likelihood appetite with LikelihoodAppetite', () => {
      const result = insertSchema.safeParse({
        ParentIds: [validParentId],
        AppetiteType: AppetiteType.Likelihood,
        LikelihoodAppetite: 2,
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty ParentIds array', () => {
      const result = insertSchema.safeParse({
        ParentIds: [],
        AppetiteType: AppetiteType.Risk,
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid UUID in ParentIds', () => {
      const result = insertSchema.safeParse({
        ParentIds: ['not-a-uuid'],
        AppetiteType: AppetiteType.Risk,
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing AppetiteType', () => {
      const result = insertSchema.safeParse({
        ParentIds: [validParentId],
      });
      expect(result.success).toBe(false);
    });

    it('rejects impact type without ImpactAppetite', () => {
      const result = insertSchema.safeParse({
        ParentIds: [validParentId],
        AppetiteType: AppetiteType.Impact,
        ImpactId: validImpactId,
      });
      expect(result.success).toBe(false);
    });

    it('rejects impact type without ImpactId', () => {
      const result = insertSchema.safeParse({
        ParentIds: [validParentId],
        AppetiteType: AppetiteType.Impact,
        ImpactAppetite: 3,
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid AppetiteType value', () => {
      const result = insertSchema.safeParse({
        ParentIds: [validParentId],
        AppetiteType: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('accepts null for optional fields on risk type', () => {
      const result = insertSchema.safeParse({
        ParentIds: [validParentId],
        AppetiteType: AppetiteType.Risk,
        LowerAppetite: null,
        UpperAppetite: null,
        Statement: null,
        EffectiveDate: null,
        CustomAttributeData: null,
      });
      expect(result.success).toBe(true);
    });

    it('rejects non-integer LowerAppetite', () => {
      const result = insertSchema.safeParse({
        ParentIds: [validParentId],
        AppetiteType: AppetiteType.Risk,
        LowerAppetite: 1.5,
      });
      expect(result.success).toBe(false);
    });

    it('accepts multiple ParentIds', () => {
      const result = insertSchema.safeParse({
        ParentIds: [validParentId, validImpactId],
        AppetiteType: AppetiteType.Risk,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('mutation', () => {
    it('calls insertAppetite with correct context for risk type', async () => {
      const mockResponse = { Id: 'new-appetite-id' };
      mockInsertAppetite.mockResolvedValueOnce(mockResponse);

      const caller = createCaller(mockContext);
      const result = await caller.insert({
        ParentIds: [validParentId],
        AppetiteType: AppetiteType.Risk,
        LowerAppetite: 2,
        UpperAppetite: 4,
      });

      expect(mockInsertAppetite).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          userId: 'test-user-id',
          tenant: 'test-tenant',
        },
        expect.objectContaining({
          ParentIds: [validParentId],
          AppetiteType: AppetiteType.Risk,
          LowerAppetite: 2,
          UpperAppetite: 4,
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('calls insertAppetite with correct context for impact type', async () => {
      const mockResponse = { Id: 'new-appetite-id' };
      mockInsertAppetite.mockResolvedValueOnce(mockResponse);

      const caller = createCaller(mockContext);
      await caller.insert({
        ParentIds: [validParentId],
        AppetiteType: AppetiteType.Impact,
        ImpactAppetite: 3,
        ImpactId: validImpactId,
      });

      expect(mockInsertAppetite).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          ParentIds: [validParentId],
          AppetiteType: AppetiteType.Impact,
          ImpactAppetite: 3,
          ImpactId: validImpactId,
        })
      );
    });

    it('calls insertAppetite with correct context for likelihood type', async () => {
      const mockResponse = { Id: 'new-appetite-id' };
      mockInsertAppetite.mockResolvedValueOnce(mockResponse);

      const caller = createCaller(mockContext);
      await caller.insert({
        ParentIds: [validParentId],
        AppetiteType: AppetiteType.Likelihood,
        LikelihoodAppetite: 2,
      });

      expect(mockInsertAppetite).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          ParentIds: [validParentId],
          AppetiteType: AppetiteType.Likelihood,
          LikelihoodAppetite: 2,
        })
      );
    });

    it('propagates TRPCError from service (403 permission denied)', async () => {
      mockInsertAppetite.mockRejectedValueOnce(
        new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create appetites',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.insert({
          ParentIds: [validParentId],
          AppetiteType: AppetiteType.Risk,
        })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: 'You do not have permission to create appetites',
      });
    });

    it('propagates TRPCError from service (404 parent not found)', async () => {
      mockInsertAppetite.mockRejectedValueOnce(
        new TRPCError({
          code: 'NOT_FOUND',
          message: 'Parent not found',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.insert({
          ParentIds: [validParentId],
          AppetiteType: AppetiteType.Risk,
        })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Parent not found',
      });
    });

    it('throws UNAUTHORIZED when user context is missing', async () => {
      const unauthCaller = createCaller(createMockContext(null));

      await expect(
        unauthCaller.insert({
          ParentIds: [validParentId],
          AppetiteType: AppetiteType.Risk,
        })
      ).rejects.toThrow(TRPCError);
    });
  });
});
