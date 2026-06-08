import { ControlType } from '@risksmart-app/domain/src/types/consts/control-type';
import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createCallerFactory } from '../../init';
import { createControlService } from '../../services/frontend/index';
import { createMockContext } from '../../test-utils/mock-context';
import { controlRouter } from './control.router';

vi.mock('@sentry/node', () => ({
  trpcMiddleware: () => (opts: { next: () => unknown }) => opts.next(),
}));

vi.mock('@risksmart-app/permitio/src/permit', () => ({
  filter: vi.fn(),
  preFilter: vi.fn(),
}));

vi.mock('../../services/frontend/index');

const mockInsertControl = vi.fn();

const mockContext = createMockContext({
  orgId: 'test-org-id',
  userId: 'test-user-id',
  tenant: 'test-tenant',
  isBackend: false,
  features: [],
});

const createCaller = createCallerFactory(controlRouter);

const validParentId = '123e4567-e89b-12d3-a456-426614174000';

describe('controlRouter.insert', () => {
  beforeEach(() => {
    vi.mocked(createControlService).mockReturnValue({
      insertControl: mockInsertControl,
      getControlsRegister: vi.fn(),
      getControlGroupsRegister: vi.fn(),
      getControlById: vi.fn(),
      getControlsByUserId: vi.fn(),
      getControlGroupsByTitle: vi.fn(),
      getControlGroupById: vi.fn(),
      getControlsBasic: vi.fn(),
      getControlGroups: vi.fn(),
      insertControlGroup: vi.fn(),
      deleteControlGroup: vi.fn(),
    });
  });

  describe('input validation', () => {
    const insertSchema = z.object({
      ParentId: z.string().uuid().nullable().optional(),
      Title: z.string().min(1),
      Description: z.string().nullable().optional(),
      Type: z.nativeEnum(ControlType).nullable().optional(),
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

    it('accepts required fields only', () => {
      const result = insertSchema.safeParse({
        ParentId: validParentId,
        Title: 'Test Control',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty Title', () => {
      const result = insertSchema.safeParse({
        ParentId: validParentId,
        Title: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes('Title'))).toBe(
          true
        );
      }
    });

    it('accepts missing ParentId (top-level control)', () => {
      const result = insertSchema.safeParse({ Title: 'Test Control' });
      expect(result.success).toBe(true);
    });

    it('accepts null ParentId', () => {
      const result = insertSchema.safeParse({
        ParentId: null,
        Title: 'Test Control',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid UUID for ParentId', () => {
      const result = insertSchema.safeParse({
        ParentId: 'not-a-uuid',
        Title: 'Test Control',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some((e) => e.path.includes('ParentId'))
        ).toBe(true);
      }
    });

    it('accepts all optional fields', () => {
      const result = insertSchema.safeParse({
        ParentId: validParentId,
        Title: 'Full Control',
        Description: 'A description',
        Type: ControlType.Preventive,
        CustomAttributeData: { key: 'value' },
        OwnerUserIds: ['user-1'],
        OwnerGroupIds: [validParentId],
        ContributorUserIds: ['user-2'],
        ContributorGroupIds: [validParentId],
        TagTypeIds: [validParentId],
        DepartmentTypeIds: [validParentId],
      });
      expect(result.success).toBe(true);
    });

    it('accepts null for optional string fields (form default values)', () => {
      const result = insertSchema.safeParse({
        ParentId: validParentId,
        Title: 'Test Control',
        Description: null,
        Type: null,
        CustomAttributeData: null,
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid ControlType', () => {
      const result = insertSchema.safeParse({
        ParentId: validParentId,
        Title: 'Test Control',
        Type: 'InvalidType',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes('Type'))).toBe(
          true
        );
      }
    });

    it('rejects invalid UUID in OwnerGroupIds', () => {
      const result = insertSchema.safeParse({
        ParentId: validParentId,
        Title: 'Test Control',
        OwnerGroupIds: ['not-a-uuid'],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('mutation', () => {
    it('calls insertControl without ParentId (top-level control)', async () => {
      const mockResponse = { Id: 'new-control-id' };
      mockInsertControl.mockResolvedValueOnce(mockResponse);

      const caller = createCaller(mockContext);
      const result = await caller.insert({ Title: 'Top-level Control' });

      expect(mockInsertControl).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          userId: 'test-user-id',
          tenant: 'test-tenant',
        },
        expect.objectContaining({
          ParentId: null,
          Title: 'Top-level Control',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('calls insertControl with correct context and required fields', async () => {
      const mockResponse = { Id: 'new-control-id' };
      mockInsertControl.mockResolvedValueOnce(mockResponse);

      const caller = createCaller(mockContext);
      const result = await caller.insert({
        ParentId: validParentId,
        Title: 'Test Control',
      });

      expect(mockInsertControl).toHaveBeenCalledWith(
        {
          orgId: 'test-org-id',
          userId: 'test-user-id',
          tenant: 'test-tenant',
        },
        expect.objectContaining({
          ParentId: validParentId,
          Title: 'Test Control',
          CustomAttributeData: null,
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('passes all optional fields through to the service', async () => {
      const mockResponse = { Id: 'new-control-id' };
      mockInsertControl.mockResolvedValueOnce(mockResponse);

      const caller = createCaller(mockContext);
      await caller.insert({
        ParentId: validParentId,
        Title: 'Full Control',
        Description: 'A description',
        Type: ControlType.Detective,
        CustomAttributeData: { key: 'value' },
        OwnerUserIds: ['user-1'],
        OwnerGroupIds: [validParentId],
        ContributorUserIds: ['user-2'],
        ContributorGroupIds: [validParentId],
        TagTypeIds: [validParentId],
        DepartmentTypeIds: [validParentId],
      });

      expect(mockInsertControl).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          ParentId: validParentId,
          Title: 'Full Control',
          Description: 'A description',
          Type: ControlType.Detective,
          CustomAttributeData: { key: 'value' },
          OwnerUserIds: ['user-1'],
          OwnerGroupIds: [validParentId],
          ContributorUserIds: ['user-2'],
          ContributorGroupIds: [validParentId],
          TagTypeIds: [validParentId],
          DepartmentTypeIds: [validParentId],
        })
      );
    });

    it('propagates TRPCError from service (403 permission denied)', async () => {
      mockInsertControl.mockRejectedValueOnce(
        new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create controls',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.insert({ ParentId: validParentId, Title: 'Test Control' })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: 'You do not have permission to create controls',
      });
    });

    it('propagates TRPCError from service (404 parent not found)', async () => {
      mockInsertControl.mockRejectedValueOnce(
        new TRPCError({
          code: 'NOT_FOUND',
          message: 'Parent not found',
        })
      );

      const caller = createCaller(mockContext);
      await expect(
        caller.insert({ ParentId: validParentId, Title: 'Test Control' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Parent not found',
      });
    });

    it('throws UNAUTHORIZED when user context is missing', async () => {
      const unauthCaller = createCaller(createMockContext(null));

      await expect(
        unauthCaller.insert({
          ParentId: validParentId,
          Title: 'Test Control',
        })
      ).rejects.toThrow(TRPCError);
    });
  });
});
