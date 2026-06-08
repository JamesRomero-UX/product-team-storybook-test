import { NotFound } from 'http-errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock modules that have side effects at import time
vi.mock('../../../../../clients/permit/constants', () => ({
  pdpEndpoint: 'http://mock-pdp',
  secretName: 'mock-secret',
}));

vi.mock('../../../../../clients/permit', () => ({
  createPermitDependencies: vi.fn(),
}));

vi.mock('../../../../../events/producers/data-event-producers', () => ({
  createObjectEventEmitters: vi.fn(),
}));

vi.mock('../../../../../repositories/db-client', () => ({
  getDatabaseConnection: vi.fn(),
}));

vi.mock('../../../../../repositories/action-update-repository', () => ({
  createActionUpdateRepository: vi.fn(),
}));

vi.mock('../../../../../utils/logger', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

// Import after mocks
import { createProcessor, type ProcessorDependencies } from './delete';

// Mock crypto for consistent UUIDs in tests
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'mocked-uuid-1234'),
}));

const createMockContext = () => ({
  tenant: 'test-tenant',
  orgKey: 'test-org',
  userId: 'user-123',
  correlationId: 'correlation-123',
});

/**
 * Creates mock dependencies for testing the processor
 */
const createMockDependencies = () => {
  const mockDeleteMany = vi.fn<(ids: string[]) => Promise<string[]>>();

  const dependencies: ProcessorDependencies = {
    actionUpdateRepository: {
      deleteMany: mockDeleteMany,
    } as unknown as ProcessorDependencies['actionUpdateRepository'],
  };

  return {
    dependencies,
    mocks: {
      deleteMany: mockDeleteMany,
    },
  };
};

describe('DELETE /action-updates (batch)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProcessor', () => {
    it('should delete objects and return deleted IDs on success', async () => {
      // Arrange
      const { dependencies, mocks } = createMockDependencies();
      const ids = [
        '123e4567-e89b-12d3-a456-426614174000',
        '223e4567-e89b-12d3-a456-426614174001',
      ];
      const payload = { Ids: ids };
      const context = createMockContext();

      mocks.deleteMany.mockResolvedValue(ids);

      const processor = createProcessor(dependencies);

      // Act
      const result = await processor({ payload, context });

      // Assert
      expect(result).toEqual(ids);
      expect(mocks.deleteMany).toHaveBeenCalledWith(ids);
    });

    it('should throw NotFound when no IDs were deleted', async () => {
      // Arrange
      const { dependencies, mocks } = createMockDependencies();
      const ids = ['123e4567-e89b-12d3-a456-426614174000'];
      const payload = { Ids: ids };
      const context = createMockContext();

      mocks.deleteMany.mockResolvedValue([]);

      const processor = createProcessor(dependencies);

      // Act & Assert
      await expect(processor({ payload, context })).rejects.toThrow(NotFound);
      await expect(processor({ payload, context })).rejects.toThrow(
        'None of the specified action updates were found'
      );
    });

    it('should succeed with partial deletion and return only deleted IDs', async () => {
      // Arrange
      const { dependencies, mocks } = createMockDependencies();
      const id1 = '123e4567-e89b-12d3-a456-426614174000';
      const id2 = '223e4567-e89b-12d3-a456-426614174001';
      const ids = [id1, id2];
      const payload = { Ids: ids };
      const context = createMockContext();

      // Only first ID is deleted
      mocks.deleteMany.mockResolvedValue([id1]);

      const processor = createProcessor(dependencies);

      // Act
      const result = await processor({ payload, context });

      // Assert
      expect(result).toEqual([id1]);
      expect(mocks.deleteMany).toHaveBeenCalledWith(ids);
    });

    it('should throw error when database delete fails', async () => {
      // Arrange
      const { dependencies, mocks } = createMockDependencies();
      const ids = [
        '123e4567-e89b-12d3-a456-426614174000',
        '223e4567-e89b-12d3-a456-426614174001',
      ];
      const payload = { Ids: ids };
      const context = createMockContext();

      mocks.deleteMany.mockRejectedValue(new Error('Database error'));

      const processor = createProcessor(dependencies);

      // Act & Assert
      await expect(processor({ payload, context })).rejects.toThrow(
        'Database error'
      );
    });

    it('should handle single ID deletion', async () => {
      // Arrange
      const { dependencies, mocks } = createMockDependencies();
      const ids = ['123e4567-e89b-12d3-a456-426614174000'];
      const payload = { Ids: ids };
      const context = createMockContext();

      mocks.deleteMany.mockResolvedValue(ids);

      const processor = createProcessor(dependencies);

      // Act
      const result = await processor({ payload, context });

      // Assert
      expect(result).toEqual(ids);
      expect(mocks.deleteMany).toHaveBeenCalledWith(ids);
    });
  });
});
