/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import type { TRPCClient } from '@trpc/client';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTrpcClient } from './client';

// Mock dependencies
vi.mock('@trpc/client', () => ({
  createTRPCClient: vi.fn(),
  httpBatchLink: vi.fn(),
}));

const mockClient = { mock: 'client' } as unknown as TRPCClient<AppRouter>;

describe('trpc/client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTrpcClient', () => {
    it('should create tRPC client with correct configuration', () => {
      const mockCreateTRPCClient = vi.mocked(createTRPCClient);
      const mockHttpBatchLink = vi.mocked(httpBatchLink);

      // Mock httpBatchLink to return a link function
      const mockLink = vi.fn();
      mockHttpBatchLink.mockReturnValue(mockLink);

      // Mock createTRPCClient to return a mock client
      mockCreateTRPCClient.mockReturnValue(mockClient);

      // Call the factory function
      const client = createTrpcClient('https://test-api.example.com', '1.0.0');

      expect(mockHttpBatchLink).toHaveBeenCalledWith({
        url: 'https://test-api.example.com/trpc',
        headers: expect.any(Function),
        transformer: expect.any(Function),
      });

      expect(mockCreateTRPCClient).toHaveBeenCalledWith({
        links: [mockLink],
      });

      expect(client).toBe(mockClient);
    });

    it('should handle URLs with trailing slash', () => {
      const mockCreateTRPCClient = vi.mocked(createTRPCClient);
      const mockHttpBatchLink = vi.mocked(httpBatchLink);

      const mockLink = vi.fn();
      mockHttpBatchLink.mockReturnValue(mockLink);
      mockCreateTRPCClient.mockReturnValue(mockClient);

      createTrpcClient('https://api.example.com/', '1.0.0');

      expect(mockHttpBatchLink).toHaveBeenCalledWith({
        url: 'https://api.example.com//trpc', // Note: double slash due to trailing slash
        headers: expect.any(Function),
        transformer: expect.any(Function),
      });
    });

    it('should handle URLs without protocol', () => {
      const mockCreateTRPCClient = vi.mocked(createTRPCClient);
      const mockHttpBatchLink = vi.mocked(httpBatchLink);

      const mockLink = vi.fn();
      mockHttpBatchLink.mockReturnValue(mockLink);
      mockCreateTRPCClient.mockReturnValue(mockClient);

      createTrpcClient('api.example.com', '1.0.0');

      expect(mockHttpBatchLink).toHaveBeenCalledWith({
        url: 'api.example.com/trpc',
        headers: expect.any(Function),
        transformer: expect.any(Function),
      });
    });
  });

  describe('headers function', () => {
    interface HeadersOpts {
      opList?: Array<{
        context?: { authorization?: string; [key: string]: unknown };
      }>;
      [key: string]: unknown;
    }
    let headersFunction: (opts?: HeadersOpts) => Record<string, string>;

    beforeEach(() => {
      const mockHttpBatchLink = vi.mocked(httpBatchLink);
      mockHttpBatchLink.mockReturnValue(vi.fn());
      vi.mocked(createTRPCClient).mockReturnValue(mockClient);

      // Create a client to trigger the setup
      createTrpcClient('https://test-api.example.com', '1.0.0');

      // Extract the headers function from the httpBatchLink call
      const httpBatchLinkCall = mockHttpBatchLink.mock.calls[0];
      headersFunction = httpBatchLinkCall?.[0]?.headers as (
        opts?: HeadersOpts
      ) => Record<string, string>;
    });

    it('should extract authorization from context and set user-agent', () => {
      const mockOpts = {
        opList: [
          {
            context: {
              authorization: 'Bearer test-token',
            },
          },
        ],
      };

      const headers = headersFunction(mockOpts);

      expect(headers).toEqual({
        authorization: 'Bearer test-token',
        'user-agent': 'external-api/1.0.0',
      });
    });

    it('should use empty authorization when context is missing', () => {
      const mockOpts = {
        opList: [{}], // no context
      };

      const headers = headersFunction(mockOpts);

      expect(headers).toEqual({
        authorization: '',
        'user-agent': 'external-api/1.0.0',
      });
    });

    it('should use empty authorization when authorization is missing from context', () => {
      const mockOpts = {
        opList: [
          {
            context: {
              other_field: 'value',
            },
          },
        ],
      };

      const headers = headersFunction(mockOpts);

      expect(headers).toEqual({
        authorization: '',
        'user-agent': 'external-api/1.0.0',
      });
    });

    it('should handle empty opList', () => {
      const mockOpts = {
        opList: [],
      };

      const headers = headersFunction(mockOpts);

      expect(headers).toEqual({
        authorization: '',
        'user-agent': 'external-api/1.0.0',
      });
    });

    it('should handle missing opList', () => {
      const mockOpts = {};

      const headers = headersFunction(mockOpts);

      expect(headers).toEqual({
        authorization: '',
        'user-agent': 'external-api/1.0.0',
      });
    });

    it('should handle null context', () => {
      const mockOpts = {
        opList: [
          {
            context: null,
          },
        ],
      } as unknown as HeadersOpts;

      const headers = headersFunction(mockOpts);

      expect(headers).toEqual({
        authorization: '',
        'user-agent': 'external-api/1.0.0',
      });
    });

    it('should handle undefined opts', () => {
      const headers = headersFunction(undefined);

      expect(headers).toEqual({
        authorization: '',
        'user-agent': 'external-api/1.0.0',
      });
    });

    it('should handle complex context objects', () => {
      const mockContext = {
        authorization: 'Bearer debug-token',
        org_id: 'test-org',
      };

      const mockOpts = {
        opList: [{ context: mockContext }],
      };

      const headers = headersFunction(mockOpts);

      expect(headers).toEqual({
        authorization: 'Bearer debug-token',
        'user-agent': 'external-api/1.0.0',
      });
    });

    it('should handle special characters in app version', () => {
      vi.clearAllMocks();

      const mockHttpBatchLink = vi.mocked(httpBatchLink);
      mockHttpBatchLink.mockReturnValue(vi.fn());
      vi.mocked(createTRPCClient).mockReturnValue(mockClient);

      // Create a client with special version
      createTrpcClient('https://test-api.example.com', '1.0.0-beta+build.123');

      expect(mockHttpBatchLink).toHaveBeenCalledWith({
        url: 'https://test-api.example.com/trpc',
        headers: expect.any(Function),
        transformer: expect.any(Function),
      });
    });

    it('should handle TRPC_SERVICE_BASE_URL without protocol', async () => {
      process.env.TRPC_SERVICE_BASE_URL = 'api.example.com';

      const mockHttpBatchLink = vi.mocked(httpBatchLink);
      mockHttpBatchLink.mockReturnValue(vi.fn());
      vi.mocked(createTRPCClient).mockReturnValue(mockClient);

      vi.resetModules();
      await import('./client');

      expect(mockHttpBatchLink).toHaveBeenCalledWith({
        url: 'https://test-api.example.com/trpc',
        headers: expect.any(Function),
        transformer: expect.any(Function),
      });
    });

    it('should use empty string as app version when not provided', () => {
      vi.clearAllMocks();

      const mockHttpBatchLink = vi.mocked(httpBatchLink);
      mockHttpBatchLink.mockReturnValue(vi.fn());
      vi.mocked(createTRPCClient).mockReturnValue(mockClient);

      // Create a client with empty version
      createTrpcClient('https://test-api.example.com', '');

      // Get the headers function
      const httpBatchLinkCall = mockHttpBatchLink.mock.calls[0];
      const emptyVersionHeadersFunction = httpBatchLinkCall?.[0]?.headers as (
        opts?: HeadersOpts
      ) => Record<string, string>;

      const headers = emptyVersionHeadersFunction({
        opList: [{ context: { authorization: 'Bearer token' } }],
      });

      expect(headers['user-agent']).toBe('external-api/');
    });
  });

  describe('batch request handling', () => {
    interface HeadersOpts {
      opList?: Array<{
        context?: { authorization?: string; [key: string]: unknown };
      }>;
      [key: string]: unknown;
    }
    let headersFunction: (opts?: HeadersOpts) => Record<string, string>;

    beforeEach(() => {
      const mockHttpBatchLink = vi.mocked(httpBatchLink);
      mockHttpBatchLink.mockReturnValue(vi.fn());
      vi.mocked(createTRPCClient).mockReturnValue(mockClient);

      createTrpcClient('https://test-api.example.com', '1.0.0');

      const httpBatchLinkCall = mockHttpBatchLink.mock.calls[0];
      headersFunction = httpBatchLinkCall?.[0]?.headers as (
        opts?: HeadersOpts
      ) => Record<string, string>;
    });

    it('should take context from first operation in batch', () => {
      const mockOpts = {
        opList: [
          { context: { authorization: 'Bearer first-token' } },
          { context: { authorization: 'Bearer second-token' } },
          { context: { authorization: 'Bearer third-token' } },
        ],
      };

      const headers = headersFunction(mockOpts);

      // Should use the first operation's context
      expect(headers.authorization).toBe('Bearer first-token');
    });

    it('should handle mixed contexts in batch', () => {
      const mockOpts = {
        opList: [
          { context: { authorization: 'Bearer token', org_id: 'org1' } },
          {
            context: {
              authorization: 'Bearer different-token',
              org_id: 'org2',
            },
          },
        ],
      };

      const headers = headersFunction(mockOpts);

      // Should use the first operation's context
      expect(headers.authorization).toBe('Bearer token');
    });
  });
});
