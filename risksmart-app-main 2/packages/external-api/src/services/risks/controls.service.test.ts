import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  ControlByIdResponse,
  ControlListQueryResponse,
  IClient,
} from '../../clients/client.interface';
import type { SeqIdQueryOpts, ServiceCallContext } from '../../types/service';
import { type ControlsService, controlsService } from './controls.service';

// Mock only the transformers to isolate the service logic
vi.mock('../transformers/control.transformer', () => ({
  transformControlListQueryResponse: vi.fn(),
  transformControlItem: vi.fn(),
}));

describe('controls.service', () => {
  let mockClient: IClient;
  let mockContext: ServiceCallContext;
  let service: ControlsService;

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

    service = controlsService(mockClient);
  });

  describe('getControls', () => {
    const mockTrpcResponse = {
      control: [
        {
          Id: '1',
          Title: 'Test Control 1',
          Description: 'Description 1',
          SequentialId: 101,
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          ModifiedAtTimestamp: '2024-01-02T00:00:00Z',
          CreatedByUser: 'user1',
          ModifiedByUser: 'user2',
          CustomAttributeData: null,
          Type: 'manual',
          tags: [],
          owners: [{ UserId: 'user1' }],
          contributors: [{ UserId: 'user2' }],
          contributorGroups: [],
          ownerGroups: [],
          parents: [],
          departments: [],
        },
        {
          Id: '2',
          Title: 'Test Control 2',
          Description: 'Description 2',
          SequentialId: 102,
          CreatedAtTimestamp: '2024-01-03T00:00:00Z',
          ModifiedAtTimestamp: '2024-01-03T00:00:00Z',
          CreatedByUser: 'user3',
          ModifiedByUser: 'user3',
          CustomAttributeData: null,
          Type: 'automated',
          tags: [],
          owners: [{ UserId: 'user3' }],
          contributors: [],
          contributorGroups: [],
          ownerGroups: [],
          parents: [],
          departments: [],
        },
      ],
      pageMetadata: undefined,
    } as unknown as ControlListQueryResponse;

    describe('happy path', () => {
      it('should fetch and transform controls successfully', async () => {
        const query: SeqIdQueryOpts = {
          limit: 1,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryControlList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getControls(query, mockContext);

        expect(mockClient.queryControlList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            afterSequentialId: null,
            beforeSequentialId: null,
            limit: 1,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.control,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });
    });

    describe('error handling', () => {
      it('should handle client error and throw descriptive error', async () => {
        const query: SeqIdQueryOpts = {
          limit: 1,
          beforeId: null,
          afterId: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryControlList).mockRejectedValue(clientError);

        await expect(service.getControls(query, mockContext)).rejects.toThrow(
          'tRPC client error'
        );

        expect(mockClient.queryControlList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            afterSequentialId: null,
            beforeSequentialId: null,
            limit: 1,
          }
        );
      });

      it('should handle non-Error objects thrown by client', async () => {
        const query: SeqIdQueryOpts = {
          limit: 1,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryControlList).mockRejectedValue(
          'string error'
        );

        await expect(service.getControls(query, mockContext)).rejects.toThrow(
          'string error'
        );
      });
    });
  });

  describe('getControlById', () => {
    const mockTrpcControl = {
      control: {
        Id: '1',
        Title: 'Test Control 1',
        Description: 'Test control description',
        Type: 'manual',
        SequentialId: 101,
        CreatedAtTimestamp: '2024-01-01T00:00:00Z',
        ModifiedAtTimestamp: '2024-01-02T00:00:00Z',
        CreatedByUser: 'user1',
        ModifiedByUser: 'user2',
        tags: [],
        owners: [{ UserId: 'user1' }],
        contributors: [{ UserId: 'user2' }],
        ancestorContributors: [
          {
            Id: 'ancestor1',
            ObjectType: 'risk',
            ContributorType: 'owner',
            AncestorId: 'ancestor-parent1',
            UserGroupId: null,
            UserId: 'user1',
          },
        ],
        departments: [],
      },
      form_configuration: null,
    } as unknown as ControlByIdResponse;

    describe('happy path', () => {
      it('should fetch and transform control by id', async () => {
        const controlId = '1';

        vi.mocked(mockClient.getControlById).mockResolvedValue(mockTrpcControl);

        const result = await service.getControlById(controlId, mockContext);

        expect(mockClient.getControlById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          controlId
        );

        expect(result).toEqual({
          data: mockTrpcControl!.control,
          form_configuration: mockTrpcControl!.form_configuration,
        });
      });

      it('should return null when control is not found', async () => {
        const controlId = '999';

        vi.mocked(mockClient.getControlById).mockResolvedValue(null);

        const result = await service.getControlById(controlId, mockContext);

        expect(mockClient.getControlById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          controlId
        );

        expect(result).toBeNull();
      });
    });

    describe('error handling', () => {
      it('should handle client error and throw descriptive error', async () => {
        const controlId = '1';
        const clientError = new Error('Control not found');

        vi.mocked(mockClient.getControlById).mockRejectedValue(clientError);

        await expect(
          service.getControlById(controlId, mockContext)
        ).rejects.toThrow('Control not found');

        expect(mockClient.getControlById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          controlId
        );
      });

      it('should handle non-Error objects thrown by client', async () => {
        const controlId = '1';

        vi.mocked(mockClient.getControlById).mockRejectedValue('string error');

        await expect(
          service.getControlById(controlId, mockContext)
        ).rejects.toThrow('string error');
      });
    });
  });

  describe('service factory', () => {
    it('should create service with correct methods', () => {
      expect(service).toHaveProperty('getControls');
      expect(service).toHaveProperty('getControlById');
      expect(typeof service.getControls).toBe('function');
      expect(typeof service.getControlById).toBe('function');
    });
  });
});
