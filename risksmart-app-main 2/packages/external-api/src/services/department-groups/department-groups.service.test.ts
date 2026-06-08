import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  DepartmentGroupTypeByIdResponse,
  DepartmentGroupTypeListQueryResponse,
  IClient,
} from '../../clients/client.interface';
import type {
  IdDateTimeQueryOpts,
  ServiceCallContext,
} from '../../types/service';
import { departmentGroupsService } from './department-groups.service';

describe('department-groups.service', () => {
  let mockClient: IClient;
  let mockContext: ServiceCallContext;
  let service: ReturnType<typeof departmentGroupsService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      queryDepartmentGroupTypeList: vi.fn(),
      getDepartmentGroupTypeById: vi.fn(),
    } as unknown as IClient;

    mockContext = {
      authToken: 'Bearer test-token',
    };

    service = departmentGroupsService(mockClient);
  });

  describe('getDepartmentGroups', () => {
    const mockTrpcResponse: DepartmentGroupTypeListQueryResponse = {
      departmentGroupType: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Name: 'Finance Group',
          CreatedAtTimestamp: '2024-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2024-01-01T00:00:00.000Z',
        } as unknown as DepartmentGroupTypeListQueryResponse['departmentGroupType'][0],
      ],
      pageMetadata: {
        nextId: null,
        nextDateTime: null,
        prevId: null,
        prevDateTime: null,
        hasNext: false,
        hasPrev: false,
        count: 1,
      },
    };

    describe('happy path', () => {
      it('should fetch and return department groups without filters', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryDepartmentGroupTypeList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getDepartmentGroups(query, mockContext);

        expect(mockClient.queryDepartmentGroupTypeList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          {
            limit: 10,
            afterDateTime: null,
            afterId: null,
            beforeDateTime: null,
            beforeId: null,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.departmentGroupType,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId and afterDateTime', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 5,
          beforeId: null,
          beforeDateTime: null,
          afterId: '123e4567-e89b-12d3-a456-426614174000',
          afterDateTime: '2024-01-01T00:00:00.000Z',
        };

        vi.mocked(mockClient.queryDepartmentGroupTypeList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getDepartmentGroups(query, mockContext);

        expect(mockClient.queryDepartmentGroupTypeList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          {
            limit: 5,
            afterDateTime: '2024-01-01T00:00:00.000Z',
            afterId: '123e4567-e89b-12d3-a456-426614174000',
            beforeDateTime: null,
            beforeId: null,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.departmentGroupType,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should pass filters.ids to the client query', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
          filters: { ids: ['123e4567-e89b-12d3-a456-426614174000'] },
        };

        vi.mocked(mockClient.queryDepartmentGroupTypeList).mockResolvedValue(
          mockTrpcResponse
        );

        await service.getDepartmentGroups(query, mockContext);

        expect(mockClient.queryDepartmentGroupTypeList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          {
            limit: 10,
            afterDateTime: null,
            afterId: null,
            beforeDateTime: null,
            beforeId: null,
            filter: { Id: ['123e4567-e89b-12d3-a456-426614174000'] },
          }
        );
      });

      it('should handle empty department group list', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        const emptyResponse: DepartmentGroupTypeListQueryResponse = {
          departmentGroupType: [],
          pageMetadata: {
            nextId: null,
            nextDateTime: null,
            prevId: null,
            prevDateTime: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        };

        vi.mocked(mockClient.queryDepartmentGroupTypeList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getDepartmentGroups(query, mockContext);

        expect(result).toEqual({
          data: [],
          metadata: emptyResponse.pageMetadata,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client.queryDepartmentGroupTypeList fails', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryDepartmentGroupTypeList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getDepartmentGroups(query, mockContext)
        ).rejects.toThrow('tRPC client error');
      });
    });
  });

  describe('getDepartmentGroupById', () => {
    const mockDepartmentGroupType = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Name: 'Finance Group',
      CreatedAtTimestamp: '2024-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2024-01-01T00:00:00.000Z',
    } as unknown as NonNullable<DepartmentGroupTypeByIdResponse>['departmentGroupType'];

    describe('happy path', () => {
      it('should fetch and return department group by id', async () => {
        const id = '123e4567-e89b-12d3-a456-426614174000';

        const mockResponse = {
          departmentGroupType: mockDepartmentGroupType,
        };

        vi.mocked(mockClient.getDepartmentGroupTypeById).mockResolvedValue(
          mockResponse as unknown as DepartmentGroupTypeByIdResponse
        );

        const result = await service.getDepartmentGroupById(id, mockContext);

        expect(mockClient.getDepartmentGroupTypeById).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          id
        );

        expect(result).toEqual({
          data: mockDepartmentGroupType,
        });
      });

      it('should return null when department group is not found', async () => {
        const id = '999e9999-e89b-12d3-a456-426614174999';

        vi.mocked(mockClient.getDepartmentGroupTypeById).mockResolvedValue(null);

        const result = await service.getDepartmentGroupById(id, mockContext);

        expect(result).toBeNull();
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client.getDepartmentGroupTypeById fails', async () => {
        const id = '123e4567-e89b-12d3-a456-426614174000';
        const clientError = new Error('Database connection failed');

        vi.mocked(mockClient.getDepartmentGroupTypeById).mockRejectedValue(
          clientError
        );

        await expect(
          service.getDepartmentGroupById(id, mockContext)
        ).rejects.toThrow('Database connection failed');
      });
    });
  });
});
