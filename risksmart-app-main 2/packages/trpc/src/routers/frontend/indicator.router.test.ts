import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createCallerFactory } from '../../init';
import { createIndicatorService } from '../../services/frontend/index';
import { createMockContext } from '../../test-utils/mock-context';
import { indicatorRouter } from './indicator.router';

vi.mock('@sentry/node', () => ({
  trpcMiddleware: () => (opts: { next: () => unknown }) => opts.next(),
}));

vi.mock('@risksmart-app/permitio/src/permit', () => ({
  filter: vi.fn(),
  preFilter: vi.fn(),
}));

vi.mock('../../services/frontend/index');

const mockDeleteIndicators = vi.fn();

const mockContext = createMockContext({
  orgId: 'test-org-id',
  userId: 'test-user-id',
  tenant: 'test-tenant',
  isBackend: false,
  features: [],
});

const createCaller = createCallerFactory(indicatorRouter);

const validId = '123e4567-e89b-12d3-a456-426614174000';
const validId2 = '223e4567-e89b-12d3-a456-426614174001';

describe('indicatorRouter.delete', () => {
  beforeEach(() => {
    vi.mocked(createIndicatorService).mockReturnValue({
      getIndicatorsRegister: vi.fn(),
      getIndicatorById: vi.fn(),
      getIndicatorResultsByIndicatorId: vi.fn(),
      getIndicatorsByParentId: vi.fn(),
      insertIndicatorResult: vi.fn(),
      updateIndicatorResult: vi.fn(),
      deleteIndicators: mockDeleteIndicators,
      deleteIndicatorResults: vi.fn(),
      updateIndicator: vi.fn(),
    });
  });

  describe('input validation', () => {
    const deleteSchema = z.object({
      ids: z
        .array(z.string().uuid())
        .min(1, 'At least one ID is required')
        .max(200, 'Maximum 200 IDs allowed per request'),
    });

    it('accepts a single valid UUID', () => {
      const result = deleteSchema.safeParse({ ids: [validId] });
      expect(result.success).toBe(true);
    });

    it('accepts multiple valid UUIDs', () => {
      const result = deleteSchema.safeParse({ ids: [validId, validId2] });
      expect(result.success).toBe(true);
    });

    it('rejects empty ids array', () => {
      const result = deleteSchema.safeParse({ ids: [] });
      expect(result.success).toBe(false);
    });

    it('rejects invalid UUID in ids', () => {
      const result = deleteSchema.safeParse({ ids: ['not-a-uuid'] });
      expect(result.success).toBe(false);
    });

    it('rejects more than 200 IDs', () => {
      const ids = Array.from(
        { length: 201 },
        (_, i) => `${i.toString().padStart(8, '0')}-e89b-12d3-a456-426614174000`
      );
      const result = deleteSchema.safeParse({ ids });
      expect(result.success).toBe(false);
    });
  });

  describe('mutation', () => {
    it('calls deleteIndicators with correct context and ids', async () => {
      mockDeleteIndicators.mockResolvedValueOnce(undefined);

      const caller = createCaller(mockContext);
      await caller.delete({ ids: [validId] });

      expect(mockDeleteIndicators).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          userId: 'test-user-id',
          tenant: 'test-tenant',
        },
        [validId]
      );
    });

    it('passes multiple ids through to service', async () => {
      mockDeleteIndicators.mockResolvedValueOnce(undefined);

      const caller = createCaller(mockContext);
      await caller.delete({ ids: [validId, validId2] });

      expect(mockDeleteIndicators).toHaveBeenCalledWith(expect.any(Object), [
        validId,
        validId2,
      ]);
    });

    it('propagates TRPCError from service (403)', async () => {
      mockDeleteIndicators.mockRejectedValueOnce(
        new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete indicators',
        })
      );

      const caller = createCaller(mockContext);
      await expect(caller.delete({ ids: [validId] })).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: 'You do not have permission to delete indicators',
      });
    });

    it('propagates TRPCError from service (404)', async () => {
      mockDeleteIndicators.mockRejectedValueOnce(
        new TRPCError({
          code: 'NOT_FOUND',
          message: 'Indicators not found',
        })
      );

      const caller = createCaller(mockContext);
      await expect(caller.delete({ ids: [validId] })).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Indicators not found',
      });
    });

    it('throws UNAUTHORIZED when user context is missing', async () => {
      const unauthCaller = createCaller(createMockContext(null));

      await expect(unauthCaller.delete({ ids: [validId] })).rejects.toThrow(
        TRPCError
      );
    });
  });
});
