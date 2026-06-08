import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createCallerFactory } from '../../init';
import { createCauseService } from '../../services/frontend/index';
import { createMockContext } from '../../test-utils/mock-context';
import { causeRouter } from './cause.router';

vi.mock('@sentry/node', () => ({
  trpcMiddleware: () => (opts: { next: () => unknown }) => opts.next(),
}));

vi.mock('@risksmart-app/permitio/src/permit', () => ({
  filter: vi.fn(),
  preFilter: vi.fn(),
}));

vi.mock('../../services/frontend/index');

const mockInsertCause = vi.fn();
const mockUpdateCause = vi.fn();
const mockDeleteCauses = vi.fn();

const mockContext = createMockContext({
  orgId: 'test-org-id',
  userId: 'test-user-id',
  tenant: 'test-tenant',
  isBackend: false,
  features: [],
});

const createCaller = createCallerFactory(causeRouter);

const validUuid = '123e4567-e89b-12d3-a456-426614174000';

describe('causeRouter.insert', () => {
  beforeEach(() => {
    vi.mocked(createCauseService).mockReturnValue({
      insertCause: mockInsertCause,
      updateCause: mockUpdateCause,
      deleteCauses: mockDeleteCauses,
      getCausesRegister: vi.fn(),
      getCausesByParentIssueId: vi.fn(),
      getCauseById: vi.fn(),
    });
    mockInsertCause.mockReset();
    mockUpdateCause.mockReset();
    mockDeleteCauses.mockReset();
  });

  describe('input validation', () => {
    const insertSchema = z.object({
      ParentIssueId: z.string().uuid(),
      Title: z.string().min(1),
      Description: z.string().nullish(),
      Significance: z.number().int().min(1).max(5).nullable().optional(),
      CustomAttributeData: z
        .record(z.string(), z.unknown())
        .nullable()
        .optional(),
    });

    it('accepts valid required fields', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: 'Test Cause',
        Description: 'Test Description',
      });
      expect(result.success).toBe(true);
    });

    it('accepts all optional fields', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: 'Test Cause',
        Description: 'Test Description',
        Significance: 3,
        CustomAttributeData: { key: 'value' },
      });
      expect(result.success).toBe(true);
    });

    it('accepts null for optional fields', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: 'Test Cause',
        Description: 'Test Description',
        Significance: null,
        CustomAttributeData: null,
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty Title', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: '',
        Description: 'Test Description',
      });
      expect(result.success).toBe(false);
    });

    it('accepts empty Description', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: 'Test Cause',
        Description: '',
      });
      expect(result.success).toBe(true);
    });

    it('accepts null Description', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: 'Test Cause',
        Description: null,
      });
      expect(result.success).toBe(true);
    });

    it('accepts omitted Description', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: 'Test Cause',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid ParentIssueId UUID', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: 'not-a-uuid',
        Title: 'Test Cause',
        Description: 'Test Description',
      });
      expect(result.success).toBe(false);
    });

    it('rejects Significance below 1', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: 'Test Cause',
        Description: 'Test Description',
        Significance: 0,
      });
      expect(result.success).toBe(false);
    });

    it('rejects Significance above 5', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: 'Test Cause',
        Description: 'Test Description',
        Significance: 6,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('mutation', () => {
    it('calls insertCause with correct context and input', async () => {
      mockInsertCause.mockResolvedValue({ Id: validUuid });
      const caller = createCaller(mockContext);

      await caller.insert({
        ParentIssueId: validUuid,
        Title: 'Test Cause',
        Description: 'Test Description',
      });

      expect(mockInsertCause).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          tenant: 'test-tenant',
          userId: 'test-user-id',
        },
        {
          ParentIssueId: validUuid,
          Title: 'Test Cause',
          Description: 'Test Description',
          Significance: null,
          CustomAttributeData: null,
        }
      );
    });

    it('defaults Description to empty string when omitted', async () => {
      mockInsertCause.mockResolvedValue({ Id: validUuid });
      const caller = createCaller(mockContext);

      await caller.insert({
        ParentIssueId: validUuid,
        Title: 'Test Cause',
      });

      expect(mockInsertCause).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          Description: '',
        })
      );
    });

    it('passes optional fields through to the service', async () => {
      mockInsertCause.mockResolvedValue({ Id: validUuid });
      const caller = createCaller(mockContext);

      await caller.insert({
        ParentIssueId: validUuid,
        Title: 'Test Cause',
        Description: 'Test Description',
        Significance: 3,
        CustomAttributeData: { key: 'value' },
      });

      expect(mockInsertCause).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          Significance: 3,
          CustomAttributeData: { key: 'value' },
        })
      );
    });

    it('propagates TRPCError from service (403)', async () => {
      mockInsertCause.mockRejectedValue(
        new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create causes',
        })
      );
      const caller = createCaller(mockContext);

      await expect(
        caller.insert({
          ParentIssueId: validUuid,
          Title: 'Test Cause',
          Description: 'Test Description',
        })
      ).rejects.toThrow(TRPCError);
    });

    it('throws UNAUTHORIZED when user context is missing', async () => {
      const unauthContext = createMockContext(null);
      const caller = createCaller(unauthContext);

      await expect(
        caller.insert({
          ParentIssueId: validUuid,
          Title: 'Test Cause',
          Description: 'Test Description',
        })
      ).rejects.toThrow();
    });
  });
});

describe('causeRouter.update', () => {
  beforeEach(() => {
    vi.mocked(createCauseService).mockReturnValue({
      insertCause: mockInsertCause,
      updateCause: mockUpdateCause,
      deleteCauses: mockDeleteCauses,
      getCausesRegister: vi.fn(),
      getCausesByParentIssueId: vi.fn(),
      getCauseById: vi.fn(),
    });
    mockUpdateCause.mockReset();
  });

  describe('input validation', () => {
    const updateSchema = z.object({
      Id: z.string().uuid(),
      ParentIssueId: z.string().uuid(),
      Title: z.string().min(1),
      Description: z.string().nullish(),
      Significance: z.number().int().min(1).max(5).nullable().optional(),
      CustomAttributeData: z
        .record(z.string(), z.unknown())
        .nullable()
        .optional(),
      OriginalTimestamp: z.string(),
    });

    it('accepts valid update input', () => {
      const result = updateSchema.safeParse({
        Id: validUuid,
        ParentIssueId: validUuid,
        Title: 'Updated Cause',
        Description: 'Updated Description',
        OriginalTimestamp: '2024-01-01T00:00:00.000Z',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing OriginalTimestamp', () => {
      const result = updateSchema.safeParse({
        Id: validUuid,
        ParentIssueId: validUuid,
        Title: 'Updated Cause',
        Description: 'Updated Description',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid Id UUID', () => {
      const result = updateSchema.safeParse({
        Id: 'not-a-uuid',
        ParentIssueId: validUuid,
        Title: 'Updated Cause',
        Description: 'Updated Description',
        OriginalTimestamp: '2024-01-01T00:00:00.000Z',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('mutation', () => {
    it('calls updateCause with correct context and input', async () => {
      mockUpdateCause.mockResolvedValue(undefined);
      const caller = createCaller(mockContext);

      await caller.update({
        Id: validUuid,
        ParentIssueId: validUuid,
        Title: 'Updated Cause',
        Description: 'Updated Description',
        OriginalTimestamp: '2024-01-01T00:00:00.000Z',
      });

      expect(mockUpdateCause).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          tenant: 'test-tenant',
          userId: 'test-user-id',
        },
        validUuid,
        {
          Id: validUuid,
          ParentIssueId: validUuid,
          Title: 'Updated Cause',
          Description: 'Updated Description',
          Significance: null,
          CustomAttributeData: null,
          OriginalTimestamp: '2024-01-01T00:00:00.000Z',
        }
      );
    });

    it('defaults Description to empty string when omitted', async () => {
      mockUpdateCause.mockResolvedValue(undefined);
      const caller = createCaller(mockContext);

      await caller.update({
        Id: validUuid,
        ParentIssueId: validUuid,
        Title: 'Updated Cause',
        OriginalTimestamp: '2024-01-01T00:00:00.000Z',
      });

      expect(mockUpdateCause).toHaveBeenCalledWith(
        expect.any(Object),
        validUuid,
        expect.objectContaining({
          Description: '',
        })
      );
    });

    it('propagates TRPCError from service (409 conflict)', async () => {
      mockUpdateCause.mockRejectedValue(
        new TRPCError({
          code: 'CONFLICT',
          message: 'Record was modified by another user',
        })
      );
      const caller = createCaller(mockContext);

      await expect(
        caller.update({
          Id: validUuid,
          ParentIssueId: validUuid,
          Title: 'Updated Cause',
          Description: 'Updated Description',
          OriginalTimestamp: '2024-01-01T00:00:00.000Z',
        })
      ).rejects.toThrow(TRPCError);
    });
  });
});

describe('causeRouter.delete', () => {
  beforeEach(() => {
    vi.mocked(createCauseService).mockReturnValue({
      insertCause: mockInsertCause,
      updateCause: mockUpdateCause,
      deleteCauses: mockDeleteCauses,
      getCausesRegister: vi.fn(),
      getCausesByParentIssueId: vi.fn(),
      getCauseById: vi.fn(),
    });
    mockDeleteCauses.mockReset();
  });

  describe('input validation', () => {
    const deleteSchema = z.object({
      Ids: z.array(z.string().uuid()).min(1).max(200),
    });

    it('accepts valid Ids array', () => {
      const result = deleteSchema.safeParse({ Ids: [validUuid] });
      expect(result.success).toBe(true);
    });

    it('rejects empty Ids array', () => {
      const result = deleteSchema.safeParse({ Ids: [] });
      expect(result.success).toBe(false);
    });

    it('rejects invalid UUID in Ids', () => {
      const result = deleteSchema.safeParse({ Ids: ['not-a-uuid'] });
      expect(result.success).toBe(false);
    });
  });

  describe('mutation', () => {
    it('calls deleteCauses with correct context and ids', async () => {
      mockDeleteCauses.mockResolvedValue({ deletedCount: 1 });
      const caller = createCaller(mockContext);

      await caller.delete({ Ids: [validUuid] });

      expect(mockDeleteCauses).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          tenant: 'test-tenant',
          userId: 'test-user-id',
        },
        [validUuid]
      );
    });

    it('propagates TRPCError from service (403)', async () => {
      mockDeleteCauses.mockRejectedValue(
        new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete causes',
        })
      );
      const caller = createCaller(mockContext);

      await expect(caller.delete({ Ids: [validUuid] })).rejects.toThrow(
        TRPCError
      );
    });
  });
});
