import { ConsequenceType } from '@risksmart-app/domain/src/types/consts/consequence-type';
import { CostType } from '@risksmart-app/domain/src/types/consts/cost-type';
import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createCallerFactory } from '../../init';
import { createConsequenceService } from '../../services/frontend/index';
import { createMockContext } from '../../test-utils/mock-context';
import { consequenceRouter } from './consequence.router';

vi.mock('@sentry/node', () => ({
  trpcMiddleware: () => (opts: { next: () => unknown }) => opts.next(),
}));

vi.mock('@risksmart-app/permitio/src/permit', () => ({
  filter: vi.fn(),
  preFilter: vi.fn(),
}));

vi.mock('../../services/frontend/index');

const mockInsertConsequence = vi.fn();
const mockUpdateConsequence = vi.fn();
const mockDeleteConsequences = vi.fn();

const mockContext = createMockContext({
  orgId: 'test-org-id',
  userId: 'test-user-id',
  tenant: 'test-tenant',
  isBackend: false,
  features: [],
});

const createCaller = createCallerFactory(consequenceRouter);

const validUuid = '123e4567-e89b-12d3-a456-426614174000';

describe('consequenceRouter.insert', () => {
  beforeEach(() => {
    vi.mocked(createConsequenceService).mockReturnValue({
      insertConsequence: mockInsertConsequence,
      updateConsequence: mockUpdateConsequence,
      deleteConsequences: mockDeleteConsequences,
      getConsequencesRegister: vi.fn(),
      getConsequencesByParentIssueId: vi.fn(),
      getConsequenceById: vi.fn(),
      getConsequenceAuditById: vi.fn(),
    });
    mockInsertConsequence.mockReset();
    mockUpdateConsequence.mockReset();
    mockDeleteConsequences.mockReset();
  });

  describe('input validation', () => {
    const insertSchema = z.object({
      ParentIssueId: z.string().uuid(),
      Title: z.string().min(1),
      Description: z.string().nullish(),
      Criticality: z.number().int().nullable().optional(),
      CostType: z.nativeEnum(CostType),
      CostValue: z.number(),
      Type: z.nativeEnum(ConsequenceType).nullish(),
      CustomAttributeData: z
        .record(z.string(), z.unknown())
        .nullable()
        .optional(),
    });

    it('accepts valid required fields', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: 'Test Consequence',
        CostType: CostType.Financial,
        CostValue: 100,
      });
      expect(result.success).toBe(true);
    });

    it('accepts all optional fields', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: 'Test Consequence',
        Description: 'Test Description',
        Criticality: 3,
        CostType: CostType.Financial,
        CostValue: 500.5,
        Type: ConsequenceType.Financial,
        CustomAttributeData: { key: 'value' },
      });
      expect(result.success).toBe(true);
    });

    it('accepts null for optional fields', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: 'Test Consequence',
        Description: null,
        Criticality: null,
        CostType: CostType.Financial,
        CostValue: 0,
        Type: null,
        CustomAttributeData: null,
      });
      expect(result.success).toBe(true);
    });

    it('accepts empty Description', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: 'Test Consequence',
        Description: '',
        CostType: CostType.Financial,
        CostValue: 100,
      });
      expect(result.success).toBe(true);
    });

    it('accepts omitted Description', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: 'Test Consequence',
        CostType: CostType.Financial,
        CostValue: 100,
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty Title', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: '',
        CostType: CostType.Financial,
        CostValue: 100,
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid ParentIssueId UUID', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: 'not-a-uuid',
        Title: 'Test Consequence',
        CostType: CostType.Financial,
        CostValue: 100,
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid CostType enum value', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: 'Test Consequence',
        CostType: 'invalid_cost_type',
        CostValue: 100,
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing CostValue', () => {
      const result = insertSchema.safeParse({
        ParentIssueId: validUuid,
        Title: 'Test Consequence',
        CostType: CostType.Financial,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('mutation', () => {
    it('calls insertConsequence with correct context and input', async () => {
      mockInsertConsequence.mockResolvedValue({ Id: validUuid });
      const caller = createCaller(mockContext);

      await caller.insert({
        ParentIssueId: validUuid,
        Title: 'Test Consequence',
        CostType: CostType.Financial,
        CostValue: 100,
      });

      expect(mockInsertConsequence).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          tenant: 'test-tenant',
          userId: 'test-user-id',
        },
        {
          ParentIssueId: validUuid,
          Title: 'Test Consequence',
          Description: '',
          Criticality: null,
          CostType: CostType.Financial,
          CostValue: 100,
          Type: null,
          CustomAttributeData: null,
        }
      );
    });

    it('defaults Description to empty string when omitted', async () => {
      mockInsertConsequence.mockResolvedValue({ Id: validUuid });
      const caller = createCaller(mockContext);

      await caller.insert({
        ParentIssueId: validUuid,
        Title: 'Test Consequence',
        CostType: CostType.Financial,
        CostValue: 100,
      });

      expect(mockInsertConsequence).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          Description: '',
        })
      );
    });

    it('passes optional fields through to the service', async () => {
      mockInsertConsequence.mockResolvedValue({ Id: validUuid });
      const caller = createCaller(mockContext);

      await caller.insert({
        ParentIssueId: validUuid,
        Title: 'Test Consequence',
        Description: 'Test Description',
        Criticality: 3,
        CostType: CostType.Financial,
        CostValue: 500,
        Type: ConsequenceType.Financial,
        CustomAttributeData: { key: 'value' },
      });

      expect(mockInsertConsequence).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          Description: 'Test Description',
          Criticality: 3,
          Type: ConsequenceType.Financial,
          CustomAttributeData: { key: 'value' },
        })
      );
    });

    it('propagates TRPCError from service (403)', async () => {
      mockInsertConsequence.mockRejectedValue(
        new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create consequences',
        })
      );
      const caller = createCaller(mockContext);

      await expect(
        caller.insert({
          ParentIssueId: validUuid,
          Title: 'Test Consequence',
          CostType: CostType.Financial,
          CostValue: 100,
        })
      ).rejects.toThrow(TRPCError);
    });

    it('throws UNAUTHORIZED when user context is missing', async () => {
      const unauthContext = createMockContext(null);
      const caller = createCaller(unauthContext);

      await expect(
        caller.insert({
          ParentIssueId: validUuid,
          Title: 'Test Consequence',
          CostType: CostType.Financial,
          CostValue: 100,
        })
      ).rejects.toThrow();
    });
  });
});

describe('consequenceRouter.update', () => {
  beforeEach(() => {
    vi.mocked(createConsequenceService).mockReturnValue({
      insertConsequence: mockInsertConsequence,
      updateConsequence: mockUpdateConsequence,
      deleteConsequences: mockDeleteConsequences,
      getConsequencesRegister: vi.fn(),
      getConsequencesByParentIssueId: vi.fn(),
      getConsequenceById: vi.fn(),
      getConsequenceAuditById: vi.fn(),
    });
    mockUpdateConsequence.mockReset();
  });

  describe('input validation', () => {
    const updateSchema = z.object({
      Id: z.string().uuid(),
      ParentIssueId: z.string().uuid(),
      Title: z.string().min(1),
      Description: z.string().nullish(),
      Criticality: z.number().int().nullable().optional(),
      CostType: z.nativeEnum(CostType),
      CostValue: z.number(),
      Type: z.nativeEnum(ConsequenceType).nullish(),
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
        Title: 'Updated Consequence',
        CostType: CostType.Financial,
        CostValue: 200,
        OriginalTimestamp: '2024-01-01T00:00:00.000Z',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing OriginalTimestamp', () => {
      const result = updateSchema.safeParse({
        Id: validUuid,
        ParentIssueId: validUuid,
        Title: 'Updated Consequence',
        CostType: CostType.Financial,
        CostValue: 200,
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid Id UUID', () => {
      const result = updateSchema.safeParse({
        Id: 'not-a-uuid',
        ParentIssueId: validUuid,
        Title: 'Updated Consequence',
        CostType: CostType.Financial,
        CostValue: 200,
        OriginalTimestamp: '2024-01-01T00:00:00.000Z',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('mutation', () => {
    it('calls updateConsequence with correct context and input', async () => {
      mockUpdateConsequence.mockResolvedValue(undefined);
      const caller = createCaller(mockContext);

      await caller.update({
        Id: validUuid,
        ParentIssueId: validUuid,
        Title: 'Updated Consequence',
        CostType: CostType.Financial,
        CostValue: 200,
        OriginalTimestamp: '2024-01-01T00:00:00.000Z',
      });

      expect(mockUpdateConsequence).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          tenant: 'test-tenant',
          userId: 'test-user-id',
        },
        validUuid,
        {
          Id: validUuid,
          ParentIssueId: validUuid,
          Title: 'Updated Consequence',
          Description: '',
          Criticality: null,
          CostType: CostType.Financial,
          CostValue: 200,
          Type: null,
          CustomAttributeData: null,
          OriginalTimestamp: '2024-01-01T00:00:00.000Z',
        }
      );
    });

    it('defaults Description to empty string when omitted', async () => {
      mockUpdateConsequence.mockResolvedValue(undefined);
      const caller = createCaller(mockContext);

      await caller.update({
        Id: validUuid,
        ParentIssueId: validUuid,
        Title: 'Updated Consequence',
        CostType: CostType.Financial,
        CostValue: 200,
        OriginalTimestamp: '2024-01-01T00:00:00.000Z',
      });

      expect(mockUpdateConsequence).toHaveBeenCalledWith(
        expect.any(Object),
        validUuid,
        expect.objectContaining({
          Description: '',
        })
      );
    });

    it('propagates TRPCError from service (409 conflict)', async () => {
      mockUpdateConsequence.mockRejectedValue(
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
          Title: 'Updated Consequence',
          CostType: CostType.Financial,
          CostValue: 200,
          OriginalTimestamp: '2024-01-01T00:00:00.000Z',
        })
      ).rejects.toThrow(TRPCError);
    });
  });
});

describe('consequenceRouter.delete', () => {
  beforeEach(() => {
    vi.mocked(createConsequenceService).mockReturnValue({
      insertConsequence: mockInsertConsequence,
      updateConsequence: mockUpdateConsequence,
      deleteConsequences: mockDeleteConsequences,
      getConsequencesRegister: vi.fn(),
      getConsequencesByParentIssueId: vi.fn(),
      getConsequenceById: vi.fn(),
      getConsequenceAuditById: vi.fn(),
    });
    mockDeleteConsequences.mockReset();
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
    it('calls deleteConsequences with correct context and ids', async () => {
      mockDeleteConsequences.mockResolvedValue({ deletedCount: 1 });
      const caller = createCaller(mockContext);

      await caller.delete({ Ids: [validUuid] });

      expect(mockDeleteConsequences).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          tenant: 'test-tenant',
          userId: 'test-user-id',
        },
        [validUuid]
      );
    });

    it('propagates TRPCError from service (403)', async () => {
      mockDeleteConsequences.mockRejectedValue(
        new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete consequences',
        })
      );
      const caller = createCaller(mockContext);

      await expect(caller.delete({ Ids: [validUuid] })).rejects.toThrow(
        TRPCError
      );
    });
  });
});
