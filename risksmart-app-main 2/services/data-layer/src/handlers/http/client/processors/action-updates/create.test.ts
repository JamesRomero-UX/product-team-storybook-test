import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ActionUpdateRepository } from '../../../../../repositories/action-update-repository';

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
import { createProcessor } from './create';

// Mock crypto for consistent UUIDs in tests
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'mocked-uuid-1234'),
}));

// Helper to create a stubbed object
type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

const stub = <T>(value: RecursivePartial<T> = {}): T => {
  return value as T;
};

const createMockContext = () => ({
  tenant: 'test-tenant',
  orgKey: 'test-org',
  userId: 'user-123',
  correlationId: 'correlation-123',
});

const createValidPayload = () => ({
  ParentActionId: '123e4567-e89b-12d3-a456-426614174000',
  Title: 'Test Action Update',
  Description: 'Test description for action update',
  CustomAttributeData: null,
});

/**
 * Creates mock dependencies for testing the processor
 */
const createMockDependencies = () => {
  const mockInsert = vi.fn();

  const actionUpdateRepository = stub<ActionUpdateRepository>({
    insert: mockInsert,
  });

  return {
    actionUpdateRepository,
    mocks: {
      insert: mockInsert,
    },
  };
};

describe('POST /action-updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProcessor', () => {
    it('should insert object on success', async () => {
      // Arrange
      const { actionUpdateRepository, mocks } = createMockDependencies();
      const payload = createValidPayload();
      const context = createMockContext();

      mocks.insert.mockResolvedValue([
        {
          Id: 'created-object-123',
          Title: payload.Title,
          Description: payload.Description,
          ParentActionId: payload.ParentActionId,
        },
      ]);

      const processor = createProcessor({
        actionUpdateRepository,
      });

      // Act
      const result = await processor({ payload, context });

      // Assert
      expect(result.Id).toBe('created-object-123');
      expect(mocks.insert).toHaveBeenCalledWith({
        ParentActionId: payload.ParentActionId,
        Title: payload.Title,
        Description: payload.Description,
        CreatedByUser: context.userId,
        ModifiedByUser: context.userId,
        OrgKey: context.orgKey,
        CustomAttributeData: null,
      });
    });

    it('should throw error when insert fails', async () => {
      // Arrange
      const { actionUpdateRepository, mocks } = createMockDependencies();
      const payload = createValidPayload();
      const context = createMockContext();

      mocks.insert.mockRejectedValue(new Error('Database error'));

      const processor = createProcessor({
        actionUpdateRepository,
      });

      // Act & Assert
      await expect(processor({ payload, context })).rejects.toThrow(
        'Database error'
      );
    });

    it('should throw error when insert returns no records', async () => {
      // Arrange
      const { actionUpdateRepository, mocks } = createMockDependencies();
      const payload = createValidPayload();
      const context = createMockContext();

      mocks.insert.mockResolvedValue([]);

      const processor = createProcessor({
        actionUpdateRepository,
      });

      // Act & Assert
      await expect(processor({ payload, context })).rejects.toThrow(
        'Failed to retrieve created action update'
      );
    });

    it('should handle CustomAttributeData correctly', async () => {
      // Arrange
      const { actionUpdateRepository, mocks } = createMockDependencies();
      const payload = {
        ...createValidPayload(),
        CustomAttributeData: { custom: 'value', nested: { data: true } },
      };
      const context = createMockContext();

      mocks.insert.mockResolvedValue([{ Id: 'created-object-123' }]);

      const processor = createProcessor({
        actionUpdateRepository,
      });

      // Act
      await processor({ payload, context });

      // Assert
      expect(mocks.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          CustomAttributeData: { custom: 'value', nested: { data: true } },
        })
      );
    });
  });
});
