import { ActionStatus } from '@risksmart-app/domain/src/types/consts/action-status';
import { TRPCError } from '@trpc/server';
import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/node', () => ({
  trpcMiddleware: () => (opts: { next: () => unknown }) => opts.next(),
}));
vi.mock('@risksmart-app/permitio/src/permit', () => ({
  filter: vi.fn(),
  preFilter: vi.fn(),
}));

const mockInsertAction = vi.fn();
vi.mock('../../services/frontend/index', () => ({
  createActionService: () => ({
    insertAction: mockInsertAction,
  }),
}));

import { createCallerFactory } from '../../init';
import { actionRouter } from './action.router';

const createCaller = createCallerFactory(actionRouter);

function createTestContext(
  overrides?: Partial<{ user: Record<string, unknown> }>
) {
  return {
    req: {} as Request,
    res: {} as Response,
    user: {
      orgId: 'org-1',
      userId: 'user-1',
      tenant: 'test-tenant',
      isBackend: false,
      features: [],
      ...overrides?.user,
    },
  };
}

const validInput = {
  Title: 'Test action',
  DateDue: '2025-06-01',
  DateRaised: '2025-01-01',
  Status: ActionStatus.Open,
};

describe('action.router insert', () => {
  it('accepts valid required-only input', async () => {
    mockInsertAction.mockResolvedValueOnce({ Id: 'new-id' });
    const caller = createCaller(createTestContext());

    const result = await caller.insert(validInput);

    expect(result).toEqual({ Id: 'new-id' });
    expect(mockInsertAction).toHaveBeenCalledWith(
      { orgId: 'org-1', tenant: 'test-tenant', userId: 'user-1' },
      expect.objectContaining({
        Title: 'Test action',
        Status: ActionStatus.Open,
        OwnerUserIds: [],
        ContributorUserIds: [],
        TagTypeIds: [],
        DepartmentTypeIds: [],
      })
    );
  });

  it('accepts valid input with all optional fields', async () => {
    mockInsertAction.mockResolvedValueOnce({ Id: 'new-id' });
    const caller = createCaller(createTestContext());

    const result = await caller.insert({
      ...validInput,
      ParentId: '00000000-0000-0000-0000-000000000001',
      Priority: 3,
      Description: 'Some description',
      ClosedDate: '2025-12-31',
      CustomAttributeData: { key: 'value' },
      OwnerUserIds: ['user-a'],
      OwnerGroupIds: ['00000000-0000-0000-0000-000000000002'],
      ContributorUserIds: ['user-b'],
      ContributorGroupIds: ['00000000-0000-0000-0000-000000000003'],
      TagTypeIds: ['00000000-0000-0000-0000-000000000004'],
      DepartmentTypeIds: ['00000000-0000-0000-0000-000000000005'],
    });

    expect(result).toEqual({ Id: 'new-id' });
    expect(mockInsertAction).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        ParentId: '00000000-0000-0000-0000-000000000001',
        Priority: 3,
        Description: 'Some description',
        OwnerUserIds: ['user-a'],
        TagTypeIds: ['00000000-0000-0000-0000-000000000004'],
      })
    );
  });

  it('rejects empty Title', async () => {
    const caller = createCaller(createTestContext());

    await expect(caller.insert({ ...validInput, Title: '' })).rejects.toThrow();
  });

  it('rejects invalid UUID for ParentId', async () => {
    const caller = createCaller(createTestContext());

    await expect(
      caller.insert({ ...validInput, ParentId: 'not-a-uuid' })
    ).rejects.toThrow();
  });

  it('rejects invalid Status', async () => {
    const caller = createCaller(createTestContext());

    await expect(
      caller.insert({
        ...validInput,
        Status: 'invalid' as ActionStatus,
      })
    ).rejects.toThrow();
  });

  it('propagates TRPCError from service', async () => {
    mockInsertAction.mockRejectedValueOnce(
      new TRPCError({ code: 'FORBIDDEN', message: 'No access' })
    );
    const caller = createCaller(createTestContext());

    await expect(caller.insert(validInput)).rejects.toThrow('No access');
  });

  it('rejects unauthenticated requests', async () => {
    const caller = createCaller({
      req: {} as Request,
      res: {} as Response,
      user: undefined as never,
    });

    await expect(caller.insert(validInput)).rejects.toThrow();
  });
});
