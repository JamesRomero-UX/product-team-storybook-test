import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createControlGroupRepository } from './control-group-repository';

const mockLogger = vi.hoisted(() => ({
  info: vi.fn(),
  error: vi.fn(),
}));

vi.mock('src/utils/logger', () => ({
  getLogger: () => mockLogger,
}));

describe('control-group-repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockInsert = (result: unknown[] | Error) => {
    const mockValues = vi.fn().mockReturnValue({
      returning:
        result instanceof Error
          ? vi.fn().mockRejectedValue(result)
          : vi.fn().mockResolvedValue(result),
    });

    return Object.assign(vi.fn().mockReturnValue({ values: mockValues }), {
      _mockValues: mockValues,
    });
  };

  const createMockDb = <T extends object>(tx: T) =>
    vi.fn().mockImplementation((callback: (tx: T) => unknown) => callback(tx));

  const insertData = {
    Title: 'New Control Group',
    Owner: 'owner-123',
    OrgKey: 'test-org',
    ModifiedByUser: 'user-123',
  };

  describe('insert', () => {
    it('should insert and return the inserted row', async () => {
      const insertedRow = { Id: 'new-id', ...insertData };
      const mockInsertFn = mockInsert([insertedRow]);
      const mockDb = createMockDb({ insert: mockInsertFn });

      const repository = createControlGroupRepository(mockDb);
      const result = await repository.insert(insertData);

      expect(result).toEqual([insertedRow]);
      expect(mockInsertFn._mockValues).toHaveBeenCalledWith(insertData);
    });

    it('should throw error and log when insert fails', async () => {
      const mockError = new Error('Database error');
      const mockDb = createMockDb({ insert: mockInsert(mockError) });

      const repository = createControlGroupRepository(mockDb);

      await expect(repository.insert(insertData)).rejects.toThrow(mockError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to insert into control_group table',
        mockError
      );
    });
  });
});
