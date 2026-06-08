import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  ActionListQueryResponse,
  IClient,
} from '../../clients/client.interface';
import type { SeqIdQueryOpts, ServiceCallContext } from '../../types/service';
import { actionsService } from './actions.service';

describe('actions.service', () => {
  let mockClient: IClient;
  let mockContext: ServiceCallContext;
  let service: ReturnType<typeof actionsService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      queryRiskList: vi.fn(),
      getRiskById: vi.fn(),
      getControlById: vi.fn(),
      queryControlList: vi.fn(),
      queryActionList: vi.fn(),
      getActionById: vi.fn(),
    } as unknown as IClient;

    mockContext = {
      authToken: 'Bearer test-token',
    };

    service = actionsService(mockClient);
  });

  describe('getActions', () => {
    const mockTrpcResponse: ActionListQueryResponse = {
      action: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Action 1',
          Description: 'Description 1',
          tags: [],
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          SequentialId: 1,
          Status: 'Draft',
          Priority: 1,
          owners: [],
          contributors: [],
          parents: [],
        } as unknown as ActionListQueryResponse['action'][0],
        {
          Id: '123e4567-e89b-12d3-a456-426614174001',
          Title: 'Test Action 2',
          Description: 'Description 2',
          tags: [],
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-02T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-02T00:00:00Z',
          SequentialId: 2,
          Status: 'Complete',
          Priority: 2,
          owners: [],
          contributors: [],
          parents: [],
        } as unknown as ActionListQueryResponse['action'][0],
      ],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 2,
      },
    };

    describe('happy path', () => {
      it('should fetch and return actions without filters', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryActionList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getActions(query, mockContext);

        expect(mockClient.queryActionList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            afterSequentialId: null,
            beforeSequentialId: null,
            limit: 10,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.action,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should use default pagination values when not provided', async () => {
        const query = {} as SeqIdQueryOpts;

        vi.mocked(mockClient.queryActionList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getActions(query, mockContext);

        expect(result).toEqual({
          data: mockTrpcResponse.action,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: null,
          afterId: 10,
        };

        vi.mocked(mockClient.queryActionList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getActions(query, mockContext);

        expect(mockClient.queryActionList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            afterSequentialId: 10,
            beforeSequentialId: null,
            limit: 5,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.action,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with beforeId correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: 20,
          afterId: null,
        };

        vi.mocked(mockClient.queryActionList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getActions(query, mockContext);

        expect(mockClient.queryActionList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            afterSequentialId: null,
            beforeSequentialId: 20,
            limit: 5,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.action,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty action list', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        const emptyResponse: ActionListQueryResponse = {
          action: [],
          pageMetadata: {
            nextId: null,
            prevId: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        };

        vi.mocked(mockClient.queryActionList).mockResolvedValue(emptyResponse);

        const result = await service.getActions(query, mockContext);

        expect(result).toEqual({
          data: [],
          metadata: emptyResponse.pageMetadata,
        });
      });
    });

    describe('error handling', () => {
      it('should throw error when client.queryActionList fails', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryActionList).mockRejectedValue(clientError);

        await expect(service.getActions(query, mockContext)).rejects.toThrow(
          'tRPC client error'
        );
      });

      it('should handle non-Error objects thrown by client', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryActionList).mockRejectedValue('string error');

        await expect(service.getActions(query, mockContext)).rejects.toThrow(
          'string error'
        );
      });

      it('should throw error with detailed message on client failure', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const clientError = new Error('Database connection lost');

        vi.mocked(mockClient.queryActionList).mockRejectedValue(clientError);

        await expect(service.getActions(query, mockContext)).rejects.toThrow(
          'Database connection lost'
        );
      });
    });
  });

  describe('getActionById', () => {
    const mockTrpcAction = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Action 1',
      Description: 'Description 1',
      tags: [],
      ModifiedByUser: 'provider|user1',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      CreatedByUser: 'provider|user1',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      SequentialId: 1,
      Status: 'Draft',
      Priority: 1,
      owners: [],
      contributors: [],
    } as unknown as NonNullable<
      Awaited<ReturnType<IClient['getActionById']>>
    >['action'];

    describe('happy path', () => {
      it('should fetch and return action by id', async () => {
        const actionId = '123e4567-e89b-12d3-a456-426614174000';

        const mockResponse = {
          action: mockTrpcAction,
          form_configuration: null,
        };
        vi.mocked(mockClient.getActionById).mockResolvedValue(mockResponse);

        const result = await service.getActionById(actionId, mockContext);

        expect(mockClient.getActionById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          actionId
        );

        expect(result).toEqual({
          data: mockResponse.action,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should return action with form_configuration when present', async () => {
        const actionId = '123e4567-e89b-12d3-a456-426614174000';

        const mockFormConfig = {
          fields: [
            { name: 'field1', type: 'text', required: true },
            { name: 'field2', type: 'number', required: false },
          ],
        } as never;

        const mockResponse = {
          action: mockTrpcAction,
          form_configuration: mockFormConfig,
        };
        vi.mocked(mockClient.getActionById).mockResolvedValue(mockResponse);

        const result = await service.getActionById(actionId, mockContext);

        expect(result).toEqual({
          data: mockResponse.action,
          form_configuration: mockFormConfig,
        });
      });

      it('should return null when action is not found (null response)', async () => {
        const actionId = '999e9999-e89b-12d3-a456-426614174999';

        vi.mocked(mockClient.getActionById).mockResolvedValue(null);

        const result = await service.getActionById(actionId, mockContext);

        expect(result).toBeNull();
      });
    });

    describe('error handling', () => {
      it('should throw error when client fails with non "not found" error', async () => {
        const actionId = '123e4567-e89b-12d3-a456-426614174000';
        const clientError = new Error('Database connection failed');

        vi.mocked(mockClient.getActionById).mockRejectedValue(clientError);

        await expect(
          service.getActionById(actionId, mockContext)
        ).rejects.toThrow('Database connection failed');
      });

      it('should handle non-Error objects thrown by client', async () => {
        const actionId = '123e4567-e89b-12d3-a456-426614174000';

        vi.mocked(mockClient.getActionById).mockRejectedValue('string error');

        await expect(
          service.getActionById(actionId, mockContext)
        ).rejects.toThrow('string error');
      });
    });
  });

  describe('service factory', () => {
    it('should create service with correct methods', () => {
      expect(service).toHaveProperty('getActions');
      expect(service).toHaveProperty('getActionById');
      expect(typeof service.getActions).toBe('function');
      expect(typeof service.getActionById).toBe('function');
    });
  });
});
