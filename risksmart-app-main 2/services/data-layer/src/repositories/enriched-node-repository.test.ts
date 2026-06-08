import type { Logger } from '@aws-lambda-powertools/logger';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type { GetEnrichedNodeByIdResponseRow } from '../types/node.types';
import type { createEnrichedNodeRepository as CreateEnrichedNodeRepositoryFn } from './enriched-node-repository';

// Mock environment and dependencies BEFORE importing modules that use them
vi.mock('../utils/logger');

// Type definitions for test mocks
interface MockTransaction {
  query: {
    node: {
      findMany: ReturnType<typeof vi.fn>;
    };
  };
}

describe('enriched-node-repository', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
  };

  let createEnrichedNodeRepository: typeof CreateEnrichedNodeRepositoryFn;

  beforeAll(async () => {
    const { getLogger } = await import('../utils/logger');
    vi.mocked(getLogger).mockReturnValue(mockLogger as unknown as Logger);

    const module = await import('./enriched-node-repository');
    createEnrichedNodeRepository = module.createEnrichedNodeRepository;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to create mock enriched node data
  const createMockNode = (
    overrides: Partial<GetEnrichedNodeByIdResponseRow> = {}
  ): GetEnrichedNodeByIdResponseRow =>
    ({
      Id: 'node-123',
      OrgKey: 'test-org',
      Title: 'Test Node',
      Description: 'Test description',
      CreatedByUser: 'user-123',
      ModifiedByUser: 'user-123',
      DeletedAt: null,
      CreatedAt: new Date('2025-01-01'),
      ModifiedAt: new Date('2025-01-01'),
      owners: [
        {
          Id: 'owner-1',
          UserId: 'user-123',
        },
      ],
      contributors: [
        {
          Id: 'contrib-1',
          UserId: 'user-456',
        },
      ],
      targetLinkedItems: [
        {
          Id: 'link-1',
          Source: 'node-456',
          Target: 'node-123',
          LinkTypeId: 'link-type-1',
        },
      ],
      sourceLinkedItems: [
        {
          Id: 'link-2',
          Source: 'node-123',
          Target: 'node-789',
          LinkTypeId: 'link-type-2',
        },
      ],
      ...overrides,
    }) as GetEnrichedNodeByIdResponseRow;

  describe('getMany', () => {
    it('should return all nodes when no filters provided', async () => {
      const mockNodes = [createMockNode(), createMockNode({ Id: 'node-456' })];

      const mockTransaction = {
        query: {
          node: {
            findMany: vi.fn().mockResolvedValue(mockNodes),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const repository = createEnrichedNodeRepository(mockDb);
      const result = await repository.getMany();

      expect(result).toEqual(mockNodes);
      expect(mockTransaction.query.node.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      );
    });

    it('should filter by nodeIds when provided', async () => {
      const mockNode = createMockNode();

      const mockTransaction = {
        query: {
          node: {
            findMany: vi.fn().mockResolvedValue([mockNode]),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const repository = createEnrichedNodeRepository(mockDb);
      const result = await repository.getMany({ nodeIds: ['node-123'] });

      expect(result).toEqual([mockNode]);
      expect(mockTransaction.query.node.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { Id: { in: ['node-123'] } },
        })
      );
    });

    it('should return empty array when no nodes match', async () => {
      const mockTransaction = {
        query: {
          node: {
            findMany: vi.fn().mockResolvedValue([]),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const repository = createEnrichedNodeRepository(mockDb);
      const result = await repository.getMany({ nodeIds: ['nonexistent'] });

      expect(result).toEqual([]);
    });

    it('should throw error and log when database query fails', async () => {
      const mockError = new Error('Database error');

      const mockTransaction = {
        query: {
          node: {
            findMany: vi.fn().mockRejectedValue(mockError),
          },
        },
      };

      const mockDb = vi
        .fn()
        .mockImplementation((callback: (tx: MockTransaction) => unknown) =>
          callback(mockTransaction as MockTransaction)
        );

      const repository = createEnrichedNodeRepository(mockDb);

      await expect(
        repository.getMany({ nodeIds: ['node-123'] })
      ).rejects.toThrow('Database error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to query enriched nodes',
        { error: mockError }
      );
    });
  });
});
