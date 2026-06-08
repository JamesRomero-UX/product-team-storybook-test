import type { Logger } from '@aws-lambda-powertools/logger';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  ActionFilters,
  createActionRepository as CreateActionRepositoryFn,
} from './action-repository';

// Mock environment and dependencies BEFORE importing modules that use them
vi.mock('../utils/logger');

// Type definitions for test mocks
interface MockTransaction {
  query: {
    action: {
      findMany: ReturnType<typeof vi.fn>;
    };
  };
}

interface ActionRegisterResponseRow {
  Id: string;
  Title: string;
  Description: string | null;
  Priority: number | null;
  DueDate: string | null;
  Status: number | null;
  DateCompleted: string | null;
  OrgKey: string;
  CreatedByUser: string;
  ModifiedByUser: string;
  CreatedAtTimestamp: string;
  ModifiedAtTimestamp: string;
  UpdateDue: string | null;
  LatestUpdateCreatedAtTimestamp: string | null;
  ParentActionId: string | null;
  ParentTitle: string | null;
  ParentType: string | null;
  owners: {
    UserId: string;
    user: {
      FriendlyName: string | null;
    } | null;
  }[];
}

interface ActionDetailResponseRow extends ActionRegisterResponseRow {
  CustomAttributeData: string | null;
  ancestorContributors: unknown[];
}

describe('action-repository', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
  };

  let createActionRepository: typeof CreateActionRepositoryFn;

  beforeAll(async () => {
    const { getLogger } = await import('../utils/logger');
    vi.mocked(getLogger).mockReturnValue(mockLogger as unknown as Logger);

    const module = await import('./action-repository');
    createActionRepository = module.createActionRepository;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to create mock action data
  const createMockAction = (
    overrides: Partial<ActionDetailResponseRow> = {}
  ): ActionDetailResponseRow => ({
    Id: 'action-123',
    Title: 'Test Action',
    Description: 'Test description',
    Priority: 1,
    DueDate: '2025-12-31',
    Status: 1,
    DateCompleted: null,
    OrgKey: 'test-org',
    CreatedByUser: 'user-123',
    ModifiedByUser: 'user-123',
    CreatedAtTimestamp: '2025-01-01T00:00:00.000Z',
    ModifiedAtTimestamp: '2025-01-01T00:00:00.000Z',
    UpdateDue: null,
    LatestUpdateCreatedAtTimestamp: null,
    ParentActionId: null,
    ParentTitle: null,
    ParentType: null,
    CustomAttributeData: null,
    ancestorContributors: [],
    owners: [
      {
        UserId: 'user-123',
        user: { FriendlyName: 'Test User' },
      },
    ],
    ...overrides,
  });

  const createMockRegisterAction = (
    overrides: Partial<ActionRegisterResponseRow> = {}
  ): ActionRegisterResponseRow => ({
    Id: 'action-123',
    Title: 'Test Action',
    Description: 'Test description',
    Priority: 1,
    DueDate: '2025-12-31',
    Status: 1,
    DateCompleted: null,
    OrgKey: 'test-org',
    CreatedByUser: 'user-123',
    ModifiedByUser: 'user-123',
    CreatedAtTimestamp: '2025-01-01T00:00:00.000Z',
    ModifiedAtTimestamp: '2025-01-01T00:00:00.000Z',
    UpdateDue: null,
    LatestUpdateCreatedAtTimestamp: null,
    ParentActionId: null,
    ParentTitle: null,
    ParentType: null,
    owners: [
      {
        UserId: 'user-123',
        user: { FriendlyName: 'Test User' },
      },
    ],
    ...overrides,
  });

  describe('getById', () => {
    it('should return action when found', async () => {
      const mockAction = createMockAction();

      const mockTransaction = {
        query: {
          action: {
            findMany: vi.fn().mockResolvedValue([mockAction]),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const repository = createActionRepository(mockDb);
      const result = await repository.getById('action-123');

      expect(result).toEqual(mockAction);
      expect(mockTransaction.query.action.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { Id: 'action-123' },
        })
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Getting action by ID', {
        actionId: 'action-123',
      });
    });

    it('should return null when action not found', async () => {
      const mockTransaction = {
        query: {
          action: {
            findMany: vi.fn().mockResolvedValue([]),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const repository = createActionRepository(mockDb);
      const result = await repository.getById('action-123');

      expect(result).toBeNull();
      expect(mockLogger.info).toHaveBeenCalledWith('Action not found', {
        actionId: 'action-123',
      });
    });

    it('should throw error and log when database query fails', async () => {
      const mockError = new Error('Database connection failed');

      const mockTransaction = {
        query: {
          action: {
            findMany: vi.fn().mockRejectedValue(mockError),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const repository = createActionRepository(mockDb);

      await expect(repository.getById('action-123')).rejects.toThrow(
        'Database connection failed'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to get action by ID',
        {
          error: mockError,
          actionId: 'action-123',
        }
      );
    });
  });

  describe('getRegister', () => {
    it('should return all actions from database', async () => {
      const mockActions: ActionRegisterResponseRow[] = [
        createMockRegisterAction({ Id: 'action-1', Title: 'Action 1' }),
        createMockRegisterAction({ Id: 'action-2', Title: 'Action 2' }),
      ];

      const mockTransaction = {
        query: {
          action: {
            findMany: vi.fn().mockResolvedValue(mockActions),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const repository = createActionRepository(mockDb);
      const result = await repository.getRegister();

      expect(result).toEqual(mockActions);
      expect(mockLogger.info).toHaveBeenCalledWith('Getting actions register', {
        filters: {},
      });
    });

    it('should apply parentId filter', async () => {
      const mockActions: ActionRegisterResponseRow[] = [
        createMockRegisterAction({
          Id: 'action-child',
          Title: 'Child Action',
          ParentActionId: 'parent-123',
        }),
      ];

      const mockTransaction = {
        query: {
          action: {
            findMany: vi.fn().mockResolvedValue(mockActions),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const filters: ActionFilters = {
        parentId: 'parent-123',
      };

      const repository = createActionRepository(mockDb);
      const result = await repository.getRegister(filters);

      expect(result).toEqual(mockActions);
      expect(mockLogger.info).toHaveBeenCalledWith('Getting actions register', {
        filters: { parentId: 'parent-123' },
      });
    });

    it('should return empty array when no actions exist', async () => {
      const mockTransaction = {
        query: {
          action: {
            findMany: vi.fn().mockResolvedValue([]),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const repository = createActionRepository(mockDb);
      const result = await repository.getRegister();

      expect(result).toEqual([]);
    });

    it('should throw error and log when database query fails', async () => {
      const mockError = new Error('Database connection failed');

      const mockTransaction = {
        query: {
          action: {
            findMany: vi.fn().mockRejectedValue(mockError),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const repository = createActionRepository(mockDb);

      await expect(repository.getRegister()).rejects.toThrow(
        'Database connection failed'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to get actions register',
        {
          error: mockError,
          filters: {},
        }
      );
    });
  });
});
