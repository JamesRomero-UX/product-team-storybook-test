import type { Logger } from '@aws-lambda-powertools/logger';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  GetActionUpdateByIdResponseRow,
  GetActionUpdatesByParentActionIdResponseRow,
} from '../types';
import type { createActionUpdateRepository as CreateActionUpdateRepositoryFn } from './action-update-repository';

// Mock environment and dependencies BEFORE importing modules that use them
vi.mock('../utils/logger');

// Type definitions for test mocks
interface MockTransaction {
  query: {
    action_update: {
      findMany: ReturnType<typeof vi.fn>;
    };
  };
  insert: ReturnType<typeof vi.fn>;
}

describe('action-update-repository', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
  };

  let createActionUpdateRepository: typeof CreateActionUpdateRepositoryFn;

  beforeAll(async () => {
    const { getLogger } = await import('../utils/logger');
    vi.mocked(getLogger).mockReturnValue(mockLogger as unknown as Logger);

    const module = await import('./action-update-repository');
    createActionUpdateRepository = module.createActionUpdateRepository;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to create mock action update data
  const createMockUpdate = (
    overrides: Partial<GetActionUpdateByIdResponseRow> = {}
  ): GetActionUpdateByIdResponseRow =>
    ({
      Id: 'update-123',
      Title: 'Test Update',
      OrgKey: 'test-org',
      CreatedByUser: 'user-123',
      ModifiedByUser: 'user-123',
      DeletedAt: null,
      Description: 'Test update description',
      CustomAttributeData: null,
      ParentActionId: 'action-123',
      CreatedAtTimestamp: '2025-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2025-01-01T00:00:00.000Z',
      files: [],
      ...overrides,
    }) as GetActionUpdateByIdResponseRow;

  describe('getById', () => {
    it('should return action update when found', async () => {
      const mockUpdate = createMockUpdate();

      const mockTransaction = {
        query: {
          action_update: {
            findMany: vi.fn().mockResolvedValue([mockUpdate]),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const repository = createActionUpdateRepository(mockDb);
      const result = await repository.getById('update-123');

      expect(result).toEqual(mockUpdate);
      expect(mockTransaction.query.action_update.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { Id: 'update-123' },
        })
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Getting action update by ID',
        {
          updateId: 'update-123',
        }
      );
    });

    it('should return null when action update not found', async () => {
      const mockTransaction = {
        query: {
          action_update: {
            findMany: vi.fn().mockResolvedValue([]),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const repository = createActionUpdateRepository(mockDb);
      const result = await repository.getById('update-123');

      expect(result).toBeNull();
      expect(mockLogger.info).toHaveBeenCalledWith('Action update not found', {
        updateId: 'update-123',
      });
    });

    it('should throw error and log when database query fails', async () => {
      const mockError = new Error('Database error');

      const mockTransaction = {
        query: {
          action_update: {
            findMany: vi.fn().mockRejectedValue(mockError),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const repository = createActionUpdateRepository(mockDb);

      await expect(repository.getById('update-123')).rejects.toThrow(
        'Database error'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to get action update by ID',
        {
          error: mockError,
          updateId: 'update-123',
        }
      );
    });
  });

  describe('getByParentId', () => {
    it('should return action updates for parent action', async () => {
      const mockUpdates: GetActionUpdatesByParentActionIdResponseRow[] = [
        createMockUpdate({
          Id: 'update-1',
          Title: 'Update 1',
        }) as unknown as GetActionUpdatesByParentActionIdResponseRow,
        createMockUpdate({
          Id: 'update-2',
          Title: 'Update 2',
        }) as unknown as GetActionUpdatesByParentActionIdResponseRow,
      ];

      const mockTransaction = {
        query: {
          action_update: {
            findMany: vi.fn().mockResolvedValue(mockUpdates),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const repository = createActionUpdateRepository(mockDb);
      const result = await repository.getByParentId('action-123');

      expect(result).toEqual(mockUpdates);
      expect(mockTransaction.query.action_update.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ParentActionId: 'action-123' },
        })
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Getting action updates by parent ID',
        {
          parentActionId: 'action-123',
        }
      );
    });

    it('should return empty array when no updates exist', async () => {
      const mockTransaction = {
        query: {
          action_update: {
            findMany: vi.fn().mockResolvedValue([]),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const repository = createActionUpdateRepository(mockDb);
      const result = await repository.getByParentId('action-123');

      expect(result).toEqual([]);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Retrieved action updates from database',
        {
          parentActionId: 'action-123',
          count: 0,
        }
      );
    });

    it('should throw error and log when database query fails', async () => {
      const mockError = new Error('Database error');

      const mockTransaction = {
        query: {
          action_update: {
            findMany: vi.fn().mockRejectedValue(mockError),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const repository = createActionUpdateRepository(mockDb);

      await expect(repository.getByParentId('action-123')).rejects.toThrow(
        'Database error'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to get action updates by parent ID',
        {
          error: mockError,
          parentActionId: 'action-123',
        }
      );
    });
  });
});
