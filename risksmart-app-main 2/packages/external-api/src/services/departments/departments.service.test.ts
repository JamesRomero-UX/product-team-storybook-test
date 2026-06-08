import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  DepartmentTypeByIdResponse,
  DepartmentTypeListQueryResponse,
  IClient,
} from '../../clients/client.interface';
import { DepartmentValidationError } from '../../errors/department.errors';
import type { MutateServiceContext } from '../../schemas/common/base.schema';
import type {
  IdDateTimeQueryOpts,
  ServiceCallContext,
} from '../../types/service';
import { departmentsService } from './departments.service';

describe('departments.service', () => {
  let mockClient: IClient;
  let mockContext: ServiceCallContext;
  let service: ReturnType<typeof departmentsService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      queryDepartmentTypeList: vi.fn(),
      getDepartmentTypeById: vi.fn(),
    } as unknown as IClient;

    mockContext = {
      authToken: 'Bearer test-token',
    };

    service = departmentsService(mockClient);
  });

  let mockMutateContext: MutateServiceContext;

  beforeEach(() => {
    mockMutateContext = {
      authToken: 'Bearer test-token',
      tenantId: 'test-tenant',
      orgId: 'test-org',
    };
  });

  describe('getDepartments', () => {
    const mockTrpcResponse: DepartmentTypeListQueryResponse = {
      departmentType: [
        {
          DepartmentTypeId: '123e4567-e89b-12d3-a456-426614174000',
          Name: 'Finance',
          Description: 'Finance department',
          CreatedAtTimestamp: '2024-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2024-01-01T00:00:00.000Z',
        } as unknown as DepartmentTypeListQueryResponse['departmentType'][0],
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
      it('should fetch and return departments without filters', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryDepartmentTypeList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getDepartments(query, mockContext);

        expect(mockClient.queryDepartmentTypeList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.departmentType,
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

        vi.mocked(mockClient.queryDepartmentTypeList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getDepartments(query, mockContext);

        expect(mockClient.queryDepartmentTypeList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.departmentType,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty department list', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        const emptyResponse: DepartmentTypeListQueryResponse = {
          departmentType: [],
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

        vi.mocked(mockClient.queryDepartmentTypeList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getDepartments(query, mockContext);

        expect(result).toEqual({
          data: [],
          metadata: emptyResponse.pageMetadata,
        });
      });

      it('should pass filter.Id when filters.ids is provided', async () => {
        const ids = [
          '123e4567-e89b-12d3-a456-426614174000',
          '223e4567-e89b-12d3-a456-426614174001',
        ];

        vi.mocked(mockClient.queryDepartmentTypeList).mockResolvedValue(
          mockTrpcResponse
        );

        await service.getDepartments(
          {
            filters: { ids },
            limit: ids.length,
            beforeId: null,
            beforeDateTime: null,
            afterId: null,
            afterDateTime: null,
          },
          mockContext
        );

        expect(mockClient.queryDepartmentTypeList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          expect.objectContaining({ filter: { Id: ids } })
        );
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client.queryDepartmentTypeList fails', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryDepartmentTypeList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getDepartments(query, mockContext)
        ).rejects.toThrow('tRPC client error');
      });
    });
  });

  describe('getDepartmentById', () => {
    const mockDepartmentType = {
      DepartmentTypeId: '123e4567-e89b-12d3-a456-426614174000',
      Name: 'Finance',
      Description: 'Finance department',
      CreatedAtTimestamp: '2024-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2024-01-01T00:00:00.000Z',
    } as unknown as NonNullable<DepartmentTypeByIdResponse>['departmentType'];

    describe('happy path', () => {
      it('should fetch and return department by id', async () => {
        const id = '123e4567-e89b-12d3-a456-426614174000';

        const mockResponse = {
          departmentType: mockDepartmentType,
        };

        vi.mocked(mockClient.getDepartmentTypeById).mockResolvedValue(
          mockResponse as unknown as DepartmentTypeByIdResponse
        );

        const result = await service.getDepartmentById(id, mockContext);

        expect(mockClient.getDepartmentTypeById).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          id
        );

        expect(result).toEqual({
          data: mockDepartmentType,
        });
      });

      it('should return null when department is not found', async () => {
        const id = '999e9999-e89b-12d3-a456-426614174999';

        vi.mocked(mockClient.getDepartmentTypeById).mockResolvedValue(null);

        const result = await service.getDepartmentById(id, mockContext);

        expect(result).toBeNull();
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client.getDepartmentTypeById fails', async () => {
        const id = '123e4567-e89b-12d3-a456-426614174000';
        const clientError = new Error('Database connection failed');

        vi.mocked(mockClient.getDepartmentTypeById).mockRejectedValue(
          clientError
        );

        await expect(
          service.getDepartmentById(id, mockContext)
        ).rejects.toThrow('Database connection failed');
      });
    });
  });

  describe('validateDepartmentIds', () => {
    const validId1 = '123e4567-e89b-12d3-a456-426614174000';
    const validId2 = '223e4567-e89b-12d3-a456-426614174001';

    describe('happy path', () => {
      it('should return matched ids when all department ids are valid', async () => {
        vi.mocked(mockClient.queryDepartmentTypeList).mockResolvedValue({
          departmentType: [
            {
              DepartmentTypeId: validId1,
            } as unknown as DepartmentTypeListQueryResponse['departmentType'][0],
            {
              DepartmentTypeId: validId2,
            } as unknown as DepartmentTypeListQueryResponse['departmentType'][0],
          ],
          pageMetadata: {
            nextId: null,
            nextDateTime: null,
            prevId: null,
            prevDateTime: null,
            hasNext: false,
            hasPrev: false,
            count: 2,
          },
        });

        const result = await service.validateDepartmentIds(
          [validId1, validId2],
          mockMutateContext
        );

        expect(result).toEqual([validId1, validId2]);
      });

      it('should deduplicate ids before querying', async () => {
        vi.mocked(mockClient.queryDepartmentTypeList).mockResolvedValue({
          departmentType: [
            {
              DepartmentTypeId: validId1,
            } as unknown as DepartmentTypeListQueryResponse['departmentType'][0],
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
        });

        await service.validateDepartmentIds(
          [validId1, validId1],
          mockMutateContext
        );

        expect(mockClient.queryDepartmentTypeList).toHaveBeenCalledOnce();
      });
    });

    describe('unhappy path', () => {
      it('should throw DepartmentValidationError when department ids are not found', async () => {
        const unknownId = '999e9999-e89b-12d3-a456-426614174999';

        vi.mocked(mockClient.queryDepartmentTypeList).mockResolvedValue({
          departmentType: [],
          pageMetadata: {
            nextId: null,
            nextDateTime: null,
            prevId: null,
            prevDateTime: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        });

        await expect(
          service.validateDepartmentIds([unknownId], mockMutateContext)
        ).rejects.toThrow(DepartmentValidationError);
      });

      it('should throw DepartmentValidationError for empty id list', async () => {
        await expect(
          service.validateDepartmentIds([], mockMutateContext)
        ).rejects.toThrow(DepartmentValidationError);
      });
    });
  });
});
