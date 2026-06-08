import { AcceptanceStatus } from '@risksmart-app/domain/src/types/consts/acceptance-status';
import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createCallerFactory } from '../../init';
import { createAcceptancesService } from '../../services/frontend/index';
import { createMockContext } from '../../test-utils/mock-context';
import { acceptanceRouter } from './acceptance.router';

vi.mock('@sentry/node', () => ({
  trpcMiddleware: () => (opts: { next: () => unknown }) => opts.next(),
}));

vi.mock('@risksmart-app/permitio/src/permit', () => ({
  filter: vi.fn(),
  preFilter: vi.fn(),
}));

vi.mock('../../services/frontend/index');

const mockInsertAcceptance = vi.fn();
const mockDeleteAcceptances = vi.fn();

const mockContext = createMockContext({
  orgId: 'test-org-id',
  userId: 'test-user-id',
  tenant: 'test-tenant',
  isBackend: false,
  features: [],
});

const createCaller = createCallerFactory(acceptanceRouter);

const validParentId = '123e4567-e89b-12d3-a456-426614174000';

describe('acceptanceRouter.insert', () => {
  beforeEach(() => {
    vi.mocked(createAcceptancesService).mockReturnValue({
      insertAcceptance: mockInsertAcceptance,
      updateAcceptance: vi.fn(),
      deleteAcceptances: mockDeleteAcceptances,
      getAcceptancesRegister: vi.fn(),
      getAcceptanceById: vi.fn(),
      getAcceptancesByParentRiskId: vi.fn(),
    });
  });

  describe('input validation', () => {
    const insertSchema = z
      .object({
        ParentId: z.string().uuid(),
        DateAcceptedFrom: z.string().min(1),
        DateAcceptedTo: z.string().min(1),
        Title: z.string().min(1),
        Details: z.string().min(1),
        Status: z.nativeEnum(AcceptanceStatus),
        ApprovedByUser: z.string().nullable().optional(),
        ApprovedByUserGroup: z.string().uuid().nullable().optional(),
        RequestedByUser: z.string().nullable().optional(),
        RequestedByUserGroup: z.string().uuid().nullable().optional(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
      })
      .refine(
        (d) => d.ApprovedByUser == null || d.ApprovedByUserGroup == null,
        {
          message:
            'ApprovedByUser and ApprovedByUserGroup are mutually exclusive',
          path: ['ApprovedByUserGroup'],
        }
      )
      .refine(
        (d) => d.RequestedByUser == null || d.RequestedByUserGroup == null,
        {
          message:
            'RequestedByUser and RequestedByUserGroup are mutually exclusive',
          path: ['RequestedByUserGroup'],
        }
      );

    it('accepts required fields only', () => {
      const result = insertSchema.safeParse({
        ParentId: validParentId,
        DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
        DateAcceptedTo: '2026-12-31T00:00:00.000Z',
        Title: 'Test Acceptance',
        Details: 'Test details',
        Status: AcceptanceStatus.Open,
      });
      expect(result.success).toBe(true);
    });

    it('accepts all optional fields (user variant)', () => {
      const result = insertSchema.safeParse({
        ParentId: validParentId,
        DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
        DateAcceptedTo: '2026-12-31T00:00:00.000Z',
        Title: 'Test Acceptance',
        Details: 'Acceptance details',
        Status: AcceptanceStatus.Open,
        ApprovedByUser: 'user-123',
        RequestedByUser: 'user-456',
        CustomAttributeData: { key: 'value' },
      });
      expect(result.success).toBe(true);
    });

    it('accepts all optional fields (group variant)', () => {
      const result = insertSchema.safeParse({
        ParentId: validParentId,
        DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
        DateAcceptedTo: '2026-12-31T00:00:00.000Z',
        Title: 'Test Acceptance',
        Details: 'Acceptance details',
        Status: AcceptanceStatus.Open,
        ApprovedByUserGroup: validParentId,
        RequestedByUserGroup: validParentId,
        CustomAttributeData: { key: 'value' },
      });
      expect(result.success).toBe(true);
    });

    it('accepts null for optional fields', () => {
      const result = insertSchema.safeParse({
        ParentId: validParentId,
        DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
        DateAcceptedTo: '2026-12-31T00:00:00.000Z',
        Title: 'Test Acceptance',
        Details: 'Test details',
        Status: AcceptanceStatus.Open,
        ApprovedByUser: null,
        ApprovedByUserGroup: null,
        RequestedByUser: null,
        RequestedByUserGroup: null,
        CustomAttributeData: null,
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid UUID for ParentId', () => {
      const result = insertSchema.safeParse({
        ParentId: 'not-a-uuid',
        DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
        DateAcceptedTo: '2026-12-31T00:00:00.000Z',
        Title: 'Test',
        Details: 'Test',
        Status: AcceptanceStatus.Open,
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing ParentId', () => {
      const result = insertSchema.safeParse({
        DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
        DateAcceptedTo: '2026-12-31T00:00:00.000Z',
        Title: 'Test',
        Details: 'Test',
        Status: AcceptanceStatus.Open,
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty DateAcceptedFrom', () => {
      const result = insertSchema.safeParse({
        ParentId: validParentId,
        DateAcceptedFrom: '',
        DateAcceptedTo: '2026-12-31T00:00:00.000Z',
        Title: 'Test',
        Details: 'Test',
        Status: AcceptanceStatus.Open,
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty DateAcceptedTo', () => {
      const result = insertSchema.safeParse({
        ParentId: validParentId,
        DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
        DateAcceptedTo: '',
        Title: 'Test',
        Details: 'Test',
        Status: AcceptanceStatus.Open,
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid Status enum value', () => {
      const result = insertSchema.safeParse({
        ParentId: validParentId,
        DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
        DateAcceptedTo: '2026-12-31T00:00:00.000Z',
        Title: 'Test',
        Details: 'Test',
        Status: 'invalid-status',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid UUID for ApprovedByUserGroup', () => {
      const result = insertSchema.safeParse({
        ParentId: validParentId,
        DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
        DateAcceptedTo: '2026-12-31T00:00:00.000Z',
        Title: 'Test',
        Details: 'Test',
        Status: AcceptanceStatus.Open,
        ApprovedByUserGroup: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('rejects both ApprovedByUser and ApprovedByUserGroup set', () => {
      const result = insertSchema.safeParse({
        ParentId: validParentId,
        DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
        DateAcceptedTo: '2026-12-31T00:00:00.000Z',
        Title: 'Test',
        Details: 'Test',
        Status: AcceptanceStatus.Open,
        ApprovedByUser: 'user-123',
        ApprovedByUserGroup: validParentId,
      });
      expect(result.success).toBe(false);
    });

    it('rejects both RequestedByUser and RequestedByUserGroup set', () => {
      const result = insertSchema.safeParse({
        ParentId: validParentId,
        DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
        DateAcceptedTo: '2026-12-31T00:00:00.000Z',
        Title: 'Test',
        Details: 'Test',
        Status: AcceptanceStatus.Open,
        RequestedByUser: 'user-456',
        RequestedByUserGroup: validParentId,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('mutation', () => {
    it('calls insertAcceptance with correct context and input', async () => {
      const mockResponse = { Id: 'new-acceptance-id' };
      mockInsertAcceptance.mockResolvedValueOnce(mockResponse);

      const caller = createCaller(mockContext);
      const result = await caller.insert({
        ParentId: validParentId,
        DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
        DateAcceptedTo: '2026-12-31T00:00:00.000Z',
        Title: 'Test Acceptance',
        Details: 'Test details',
        Status: AcceptanceStatus.Open,
      });

      expect(mockInsertAcceptance).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          userId: 'test-user-id',
          tenant: 'test-tenant',
        },
        expect.objectContaining({
          ParentId: validParentId,
          DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
          DateAcceptedTo: '2026-12-31T00:00:00.000Z',
          Title: 'Test Acceptance',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('passes optional fields through to service', async () => {
      const mockResponse = { Id: 'new-acceptance-id' };
      mockInsertAcceptance.mockResolvedValueOnce(mockResponse);

      const caller = createCaller(mockContext);
      await caller.insert({
        ParentId: validParentId,
        DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
        DateAcceptedTo: '2026-12-31T00:00:00.000Z',
        Title: 'Test Acceptance',
        Details: 'Test details',
        Status: AcceptanceStatus.Open,
        ApprovedByUser: 'user-123',
        CustomAttributeData: { custom: 'data' },
      });

      expect(mockInsertAcceptance).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          Status: AcceptanceStatus.Open,
          ApprovedByUser: 'user-123',
          CustomAttributeData: { custom: 'data' },
        })
      );
    });

    it('propagates TRPCError from service (403 permission denied)', async () => {
      mockInsertAcceptance.mockRejectedValueOnce(
        new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create acceptances',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.insert({
          ParentId: validParentId,
          DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
          DateAcceptedTo: '2026-12-31T00:00:00.000Z',
          Title: 'Test',
          Details: 'Test',
          Status: AcceptanceStatus.Open,
        })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: 'You do not have permission to create acceptances',
      });
    });

    it('propagates TRPCError from service (404 parent not found)', async () => {
      mockInsertAcceptance.mockRejectedValueOnce(
        new TRPCError({
          code: 'NOT_FOUND',
          message: 'Parent risk not found',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.insert({
          ParentId: validParentId,
          DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
          DateAcceptedTo: '2026-12-31T00:00:00.000Z',
          Title: 'Test',
          Details: 'Test',
          Status: AcceptanceStatus.Open,
        })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Parent risk not found',
      });
    });

    it('throws UNAUTHORIZED when user context is missing', async () => {
      const unauthCaller = createCaller(createMockContext(null));

      await expect(
        unauthCaller.insert({
          ParentId: validParentId,
          DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
          DateAcceptedTo: '2026-12-31T00:00:00.000Z',
          Title: 'Test',
          Details: 'Test',
          Status: AcceptanceStatus.Open,
        })
      ).rejects.toThrow(TRPCError);
    });
  });
});

describe('acceptanceRouter.delete', () => {
  beforeEach(() => {
    vi.mocked(createAcceptancesService).mockReturnValue({
      insertAcceptance: vi.fn(),
      updateAcceptance: vi.fn(),
      deleteAcceptances: mockDeleteAcceptances,
      getAcceptancesRegister: vi.fn(),
      getAcceptanceById: vi.fn(),
      getAcceptancesByParentRiskId: vi.fn(),
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
      const result = deleteSchema.safeParse({
        ids: [validParentId],
      });
      expect(result.success).toBe(true);
    });

    it('accepts multiple valid UUIDs', () => {
      const result = deleteSchema.safeParse({
        ids: [validParentId, '223e4567-e89b-12d3-a456-426614174001'],
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty array', () => {
      const result = deleteSchema.safeParse({
        ids: [],
      });
      expect(result.success).toBe(false);
    });

    it('rejects non-UUID strings', () => {
      const result = deleteSchema.safeParse({
        ids: ['not-a-uuid'],
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing ids field', () => {
      const result = deleteSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('mutation', () => {
    it('calls deleteAcceptances with correct context and ids', async () => {
      mockDeleteAcceptances.mockResolvedValueOnce(undefined);

      const caller = createCaller(mockContext);
      await caller.delete({
        ids: [validParentId],
      });

      expect(mockDeleteAcceptances).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          userId: 'test-user-id',
          tenant: 'test-tenant',
        },
        [validParentId]
      );
    });

    it('propagates TRPCError from service (403 permission denied)', async () => {
      mockDeleteAcceptances.mockRejectedValueOnce(
        new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete acceptances',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.delete({ ids: [validParentId] })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: 'You do not have permission to delete acceptances',
      });
    });

    it('propagates TRPCError from service (404 not found)', async () => {
      mockDeleteAcceptances.mockRejectedValueOnce(
        new TRPCError({
          code: 'NOT_FOUND',
          message: 'Acceptances not found',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.delete({ ids: [validParentId] })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Acceptances not found',
      });
    });

    it('throws UNAUTHORIZED when user context is missing', async () => {
      const unauthCaller = createCaller(createMockContext(null));

      await expect(
        unauthCaller.delete({ ids: [validParentId] })
      ).rejects.toThrow(TRPCError);
    });
  });
});
