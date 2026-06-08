import type { CreateActionRequest } from '@risksmart-app/events/src/types/request-types';
import axios, { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { OwnershipFilter } from '../routers/frontend/my-items.router';

vi.mock('axios');
vi.mock('./client-utils', () => ({
  createCachedSsmParameter: vi.fn(),
  getRequestHeaders: vi.fn().mockResolvedValue({}),
  getUrlFromSsmParam: vi.fn().mockResolvedValue('https://data-layer.test'),
}));

import { getRequestHeaders } from './client-utils';
import type { PaginatedResponse } from './data-layer-api-client';
import { DataLayerApiClient, DataLayerApiError } from './data-layer-api-client';

const mockedAxios = vi.mocked(axios, true);
const mockedGetRequestHeaders = vi.mocked(getRequestHeaders);

const mockContext = {
  tenant: 'test-tenant',
  orgKey: 'org-1',
  userId: 'user-1',
};

const testActionBody: CreateActionRequest = {
  Title: 'Test',
  DateDue: '2026-01-01',
  DateRaised: '2026-01-01',
  Status: 'open',
};

const testOwnershipFilter: OwnershipFilter = {
  owner: true,
  contributor: false,
  groupOwner: false,
  groupContributor: false,
  inheritedOwner: false,
  inheritedContributor: false,
  inheritedGroupOwner: false,
  inheritedGroupContributor: false,
};

function createPaginatedResponse<T>(
  data: T[],
  hasNextPage: boolean,
  nextCursor: number | null
): PaginatedResponse<T> {
  return {
    data,
    pageMetadata: {
      hasNextPage,
      hasPreviousPage: false,
      nextCursor,
      previousCursor: null,
    },
  };
}

describe('DataLayerApiClient', () => {
  let client: DataLayerApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new DataLayerApiClient();
  });

  describe('DataLayerApiError', () => {
    it('is an instance of Error', () => {
      const error = new DataLayerApiError(
        404,
        { message: 'Not found' },
        'test'
      );
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('DataLayerApiError');
      expect(error.status).toBe(404);
      expect(error.responseBody).toEqual({ message: 'Not found' });
      expect(error.message).toBe('test');
    });
  });

  describe('getApiUrl (caching)', () => {
    it('caches the API URL after first call', async () => {
      mockedAxios.request.mockResolvedValue({
        status: 200,
        data: { data: { Id: '1' } },
      });

      await client.getActionById(mockContext, 'a1');
      await client.getActionById(mockContext, 'a2');

      const { getUrlFromSsmParam: mockedGetUrl } =
        await import('./client-utils');
      expect(mockedGetUrl).toHaveBeenCalledTimes(1);
    });

    it('strips trailing slash from API URL', async () => {
      const { getUrlFromSsmParam: mockedGetUrl } =
        await import('./client-utils');
      vi.mocked(mockedGetUrl).mockResolvedValueOnce('https://data-layer.test/');

      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { data: { Id: '1' } },
      });

      await client.getActionById(mockContext, 'a1');

      const url = mockedAxios.request.mock.calls[0]?.[0]?.url;
      expect(url).toBe('https://data-layer.test/actions/a1');
    });
  });

  describe('request (headers and signing)', () => {
    it('sets tenant, org-key, user-id, and content-type headers', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { data: { Id: '1' } },
      });

      await client.getActionById(mockContext, 'a1');

      expect(mockedGetRequestHeaders).toHaveBeenCalledWith(
        expect.any(String),
        'GET',
        expect.objectContaining({
          'x-tenant': 'test-tenant',
          'x-org-key': 'org-1',
          'x-user-id': 'user-1',
          'Content-Type': 'application/json',
        }),
        ''
      );
    });

    it('includes correlation ID header when provided', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { data: { Id: 'new-action' } },
      });

      await client.createAction(mockContext, testActionBody, 'corr-123');

      expect(mockedGetRequestHeaders).toHaveBeenCalledWith(
        expect.any(String),
        'POST',
        expect.objectContaining({
          'x-correlation-id': 'corr-123',
        }),
        expect.any(String)
      );
    });

    it('does not include correlation ID header when not provided', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { data: [] },
      });

      await client.getUserGroupsWithApprovers(mockContext);

      const headers = mockedGetRequestHeaders.mock.calls[0]?.[2];
      expect(headers).not.toHaveProperty('x-correlation-id');
    });

    it('sends request body as JSON string for signing', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { data: { Id: '1' } },
      });

      await client.createAction(mockContext, testActionBody, 'corr-1');

      expect(mockedGetRequestHeaders).toHaveBeenCalledWith(
        expect.any(String),
        'POST',
        expect.any(Object),
        JSON.stringify(testActionBody)
      );
    });
  });

  describe('response unwrapping', () => {
    it('unwraps wrapped response via requestWrapped', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { data: [{ Id: '1' }, { Id: '2' }] },
      });

      const result = await client.getUserGroupsWithApprovers(mockContext);

      expect(result.data).toEqual([{ Id: '1' }, { Id: '2' }]);
    });

    it('unwraps and normalizes single item to array via requestSingleItem', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { data: { Id: 'action-1', Title: 'Test' } },
      });

      const result = await client.getActionById(mockContext, 'action-1');

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toEqual([{ Id: 'action-1', Title: 'Test' }]);
    });

    it('does not double-wrap when response is already an array', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { data: [{ Id: '1' }, { Id: '2' }] },
      });

      const result = await client.getActionById(mockContext, 'action-1');

      expect(result.data).toEqual([{ Id: '1' }, { Id: '2' }]);
    });

    it('returns raw data for non-wrapped endpoints', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: undefined,
      });

      const result = await client.deleteActionUpdates(
        mockContext,
        ['id-1'],
        'corr-1'
      );

      expect(result.status).toBe(200);
    });
  });

  describe('error handling', () => {
    it('throws DataLayerApiError for 4xx/5xx responses', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 404,
        data: { message: 'Not found' },
      });

      const error = await client
        .getActionById(mockContext, 'missing-id')
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(DataLayerApiError);
      if (error instanceof DataLayerApiError) {
        expect(error.status).toBe(404);
        expect(error.responseBody).toEqual({ message: 'Not found' });
      }
    });

    it('throws DataLayerApiError for rawRequest endpoints (delete)', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 500,
        data: { message: 'Server error' },
      });

      const error = await client
        .deleteActionUpdates(mockContext, ['id-1'], 'corr-1')
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(DataLayerApiError);
      if (error instanceof DataLayerApiError) {
        expect(error.status).toBe(500);
        expect(error.responseBody).toEqual({ message: 'Server error' });
      }
    });

    it('throws with details when axios throws a network error', async () => {
      const axiosError = new AxiosError('Network Error');
      Object.defineProperty(axiosError, 'response', {
        value: {
          status: 503,
          data: undefined,
          statusText: 'Service Unavailable',
          headers: {},
          config: { headers: new axios.AxiosHeaders() },
        },
      });
      mockedAxios.request.mockRejectedValueOnce(axiosError);

      await expect(client.getActionById(mockContext, 'a1')).rejects.toThrow(
        /failed: 503/
      );
    });

    it('re-throws non-Axios errors as-is', async () => {
      mockedAxios.request.mockRejectedValueOnce(new TypeError('bad type'));

      await expect(client.getActionById(mockContext, 'a1')).rejects.toThrow(
        TypeError
      );
    });
  });

  describe('buildQueryString', () => {
    it('omits undefined query params', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: createPaginatedResponse([], false, null),
      });

      await client.getActionsRegister(mockContext, {
        parentId: undefined,
        departmentTypeIds: ['dept-1'],
      });

      const url = mockedAxios.request.mock.calls[0]?.[0]?.url;
      expect(url).not.toContain('parentId');
      expect(url).toContain('departmentTypeIds=dept-1');
    });

    it('joins array values with commas', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: createPaginatedResponse([], false, null),
      });

      await client.getActionsRegister(mockContext, {
        departmentTypeIds: ['dept-1', 'dept-2'],
      });

      const url = mockedAxios.request.mock.calls[0]?.[0]?.url;
      expect(url).toContain('departmentTypeIds=dept-1%2Cdept-2');
    });

    it('produces no query string when all params are undefined', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { data: [] },
      });

      await client.getUserGroupsWithApprovers(mockContext);

      const url = mockedAxios.request.mock.calls[0]?.[0]?.url;
      expect(url).toBe('https://data-layer.test/user-groups');
    });

    it('converts boolean params to string', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { data: [] },
      });

      await client.getMyDueActions(mockContext, {
        date: '2026-01-01',
        userId: 'user-1',
        ownershipFilter: testOwnershipFilter,
      });

      const url = mockedAxios.request.mock.calls[0]?.[0]?.url;
      expect(url).toContain('owner=true');
    });
  });

  describe('getActionsRegister (requestAllPages)', () => {
    it('returns all data from a single page', async () => {
      const items = [{ Id: '1' }, { Id: '2' }];
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: createPaginatedResponse(items, false, null),
      });

      const result = await client.getActionsRegister(mockContext);

      expect(result.status).toBe(200);
      expect(result.data).toHaveLength(2);
      expect(result.data).toEqual(items);
    });

    it('accumulates data across multiple pages', async () => {
      const page1 = [{ Id: '1' }, { Id: '2' }];
      const page2 = [{ Id: '3' }, { Id: '4' }];
      const page3 = [{ Id: '5' }];

      mockedAxios.request
        .mockResolvedValueOnce({
          status: 200,
          data: createPaginatedResponse(page1, true, 2),
        })
        .mockResolvedValueOnce({
          status: 200,
          data: createPaginatedResponse(page2, true, 4),
        })
        .mockResolvedValueOnce({
          status: 200,
          data: createPaginatedResponse(page3, false, null),
        });

      const result = await client.getActionsRegister(mockContext);

      expect(result.status).toBe(200);
      expect(result.data).toHaveLength(5);
      expect(result.data).toEqual([...page1, ...page2, ...page3]);
      expect(mockedAxios.request.mock.calls).toHaveLength(3);
    });

    it('passes filter query params on every page request', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: createPaginatedResponse([], false, null),
      });

      await client.getActionsRegister(mockContext, {
        parentId: 'parent-1',
        departmentTypeIds: ['dept-1'],
        tagTypeIds: ['tag-1'],
      });

      const url = mockedAxios.request.mock.calls[0]?.[0]?.url;
      expect(url).toContain('parentId=parent-1');
      expect(url).toContain('departmentTypeIds=dept-1');
      expect(url).toContain('tagTypeIds=tag-1');
      expect(url).toContain('limit=');
      expect(url).toContain('offset=');
    });

    it('throws DataLayerApiError when a page request fails', async () => {
      const page1 = [{ Id: '1' }];
      mockedAxios.request
        .mockResolvedValueOnce({
          status: 200,
          data: createPaginatedResponse(page1, true, 1),
        })
        .mockResolvedValueOnce({
          status: 500,
          data: { error: 'Internal Server Error' },
        });

      await expect(client.getActionsRegister(mockContext)).rejects.toThrow(
        DataLayerApiError
      );
    });

    it('returns empty array when no data exists', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: createPaginatedResponse([], false, null),
      });

      const result = await client.getActionsRegister(mockContext);

      expect(result.status).toBe(200);
      expect(result.data).toEqual([]);
    });

    it('uses nextCursor for offset on subsequent pages', async () => {
      mockedAxios.request
        .mockResolvedValueOnce({
          status: 200,
          data: createPaginatedResponse([{ Id: '1' }], true, 500),
        })
        .mockResolvedValueOnce({
          status: 200,
          data: createPaginatedResponse([{ Id: '2' }], false, null),
        });

      await client.getActionsRegister(mockContext);

      const secondCallUrl = mockedAxios.request.mock.calls[1]?.[0]?.url;
      expect(secondCallUrl).toContain('offset=500');
    });

    it('falls back to offset + pageSize when nextCursor is null', async () => {
      mockedAxios.request
        .mockResolvedValueOnce({
          status: 200,
          data: createPaginatedResponse([{ Id: '1' }], true, null),
        })
        .mockResolvedValueOnce({
          status: 200,
          data: createPaginatedResponse([{ Id: '2' }], false, null),
        });

      await client.getActionsRegister(mockContext);

      const secondCallUrl = mockedAxios.request.mock.calls[1]?.[0]?.url;
      // Default page size is 500, so offset should be 500
      expect(secondCallUrl).toContain('offset=500');
    });

    it('breaks early when a page returns empty data with hasNextPage true', async () => {
      mockedAxios.request
        .mockResolvedValueOnce({
          status: 200,
          data: createPaginatedResponse([{ Id: '1' }], true, 1),
        })
        .mockResolvedValueOnce({
          status: 200,
          data: createPaginatedResponse([], true, 2),
        });

      const result = await client.getActionsRegister(mockContext);

      expect(result.data).toEqual([{ Id: '1' }]);
      expect(mockedAxios.request.mock.calls).toHaveLength(2);
    });
  });
});
