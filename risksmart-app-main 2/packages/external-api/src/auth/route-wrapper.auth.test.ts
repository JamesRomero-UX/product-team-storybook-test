import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createMockNext,
  createMockRequest,
  createMockResponse,
} from '../testing/test-utils';
import type { HandlerWithAuth } from '../types/request';
import { createAuthMiddleware } from './route-wrapper.auth';
import type { ResourceScopeKey } from './scopes';
import { expandScopes, hasAny, normalizeScopes } from './scopes.auth';

// Mock the scopes auth functions
vi.mock('../auth/scopes.auth', () => ({
  expandScopes: vi.fn(),
  hasAny: vi.fn(),
  normalizeScopes: vi.fn(),
}));

describe('auth.middleware', () => {
  const mockExpandScopes = vi.mocked(expandScopes);
  const mockHasAny = vi.mocked(hasAny);
  const mockNormalizeScopes = vi.mocked(normalizeScopes);

  let mockHandler: HandlerWithAuth;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    mockNormalizeScopes.mockReturnValue(['risks:read']);
    mockExpandScopes.mockReturnValue(
      new Set(['risks:read', 'risks:list', 'risks:get'])
    );
    mockHasAny.mockReturnValue(true);
    // Create a mock handler
    mockHandler = vi.fn().mockResolvedValue(undefined);
  });

  describe('createAuthMiddleware', () => {
    it('should return 401 when request has no auth', async () => {
      const middleware = createAuthMiddleware(
        {
          requiredScopes: ['risks:read'],
        },
        mockHandler
      );
      const req = createMockRequest({ auth: undefined });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          message: 'Unauthenticated',
        })
      );
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should return 401 when org_id is missing', async () => {
      const middleware = createAuthMiddleware(
        {
          requiredScopes: ['risks:read'],
        },
        mockHandler
      );
      const req = createMockRequest({
        auth: {
          tenant_id: 'tenant123',
          permissions: 'risks:read',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          message: 'Missing org_id | tenant_id claim',
        })
      );
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should return 401 when tenant_id is missing', async () => {
      const middleware = createAuthMiddleware(
        {
          requiredScopes: ['risks:read'],
        },
        mockHandler
      );
      const req = createMockRequest({
        auth: {
          org_id: 'org123',
          permissions: 'risks:read',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          message: 'Missing org_id | tenant_id claim',
        })
      );
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should return 401 when both org_id and tenant_id are missing', async () => {
      const middleware = createAuthMiddleware(
        {
          requiredScopes: ['risks:read'],
        },
        mockHandler
      );
      const req = createMockRequest({
        auth: {
          permissions: 'risks:read',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          message: 'Missing org_id | tenant_id claim',
        })
      );
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should return 403 when extraCheck returns false', async () => {
      const extraCheck = vi.fn().mockResolvedValue(false);
      const middleware = createAuthMiddleware(
        {
          requiredScopes: ['risks:read'],
          extraCheck,
        },
        mockHandler
      );
      const req = createMockRequest({
        auth: {
          org_id: 'org123',
          tenant_id: 'tenant123',
          permissions: 'risks:read',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(extraCheck).toHaveBeenCalledWith(req);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          message: 'Forbidden, insufficient permissions for this resource',
        })
      );
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should return 403 when extraCheck throws an error', async () => {
      const extraCheck = vi.fn().mockRejectedValue(new Error('Check failed'));
      const middleware = createAuthMiddleware(
        {
          requiredScopes: ['risks:read'],
          extraCheck,
        },
        mockHandler
      );
      const req = createMockRequest({
        auth: {
          org_id: 'org123',
          tenant_id: 'tenant123',
          permissions: 'risks:read',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await expect(middleware(req, res, next)).rejects.toThrow('Check failed');
      expect(extraCheck).toHaveBeenCalledWith(req);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should call handler when user has required scopes', async () => {
      mockHasAny.mockReturnValue(true);
      const middleware = createAuthMiddleware(
        {
          requiredScopes: ['risks:read'],
        },
        mockHandler
      );
      const req = createMockRequest({
        auth: {
          org_id: 'org123',
          tenant_id: 'tenant123',
          permissions: 'risks:read',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockHasAny).toHaveBeenCalledWith(expect.any(Set), ['risks:read']);
      expect(mockHandler).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when user lacks required scopes', async () => {
      mockHasAny.mockReturnValue(false);
      mockExpandScopes.mockReturnValue(new Set(['users:read']));
      const middleware = createAuthMiddleware(
        {
          requiredScopes: ['risks:read'],
        },
        mockHandler
      );
      const req = createMockRequest({
        auth: {
          org_id: 'org123',
          tenant_id: 'tenant123',
          permissions: 'users:read',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          message: 'Insufficient scope for this resource',
        })
      );
      expect(mockHasAny).toHaveBeenCalledWith(expect.any(Set), ['risks:read']);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should call handler when extraCheck returns true', async () => {
      const extraCheck = vi.fn().mockResolvedValue(true);
      const middleware = createAuthMiddleware(
        {
          requiredScopes: ['risks:read'],
          extraCheck,
        },
        mockHandler
      );
      const req = createMockRequest({
        auth: {
          org_id: 'org123',
          tenant_id: 'tenant123',
          permissions: 'risks:read',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(extraCheck).toHaveBeenCalledWith(req);
      expect(mockHandler).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call handler when no extraCheck is provided', async () => {
      const middleware = createAuthMiddleware(
        {
          requiredScopes: ['risks:read'],
        },
        mockHandler
      );
      const req = createMockRequest({
        auth: {
          org_id: 'org123',
          tenant_id: 'tenant123',
          permissions: 'risks:read',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockHandler).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle array scopes correctly', async () => {
      mockNormalizeScopes.mockReturnValue([
        'risks:read',
        'users:write',
      ] as ResourceScopeKey[]);
      mockExpandScopes.mockReturnValue(
        new Set([
          'risks:read',
          'risks:list',
          'risks:get',
          'users:write',
          'users:create',
          'users:update',
          'users:delete',
        ] as ResourceScopeKey[])
      );

      const middleware = createAuthMiddleware(
        {
          requiredScopes: ['risks:read'],
        },
        mockHandler
      );
      const req = createMockRequest({
        auth: {
          org_id: 'org123',
          tenant_id: 'tenant123',
          permissions: ['risks:read', 'users:write'] as unknown as string,
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockNormalizeScopes).toHaveBeenCalledWith(
        ['risks:read', 'users:write'],
        ','
      );
      expect(mockHandler).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle empty scope correctly', async () => {
      mockNormalizeScopes.mockReturnValue([]);
      mockExpandScopes.mockReturnValue(new Set());
      mockHasAny.mockReturnValue(false);

      const middleware = createAuthMiddleware(
        {
          requiredScopes: ['risks:read'],
        },
        mockHandler
      );
      const req = createMockRequest({
        auth: {
          org_id: 'org123',
          tenant_id: 'tenant123',
          permissions: '',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockNormalizeScopes).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          message: 'Insufficient scope for this resource',
        })
      );
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should handle undefined scope correctly', async () => {
      mockNormalizeScopes.mockReturnValue([]);
      mockExpandScopes.mockReturnValue(new Set());
      mockHasAny.mockReturnValue(false);

      const middleware = createAuthMiddleware(
        {
          requiredScopes: ['risks:read'],
        },
        mockHandler
      );
      const req = createMockRequest({
        auth: {
          org_id: 'org123',
          tenant_id: 'tenant123',
          permissions: undefined,
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockNormalizeScopes).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          message: 'Insufficient scope for this resource',
        })
      );
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should properly call scope processing functions in correct order', async () => {
      const middleware = createAuthMiddleware(
        {
          requiredScopes: ['risks:read'],
        },
        mockHandler
      );
      const req = createMockRequest({
        auth: {
          org_id: 'org123',
          tenant_id: 'tenant123',
          permissions: 'risks:read risks:write',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await middleware(req, res, next);

      expect(mockNormalizeScopes).toHaveBeenCalledWith(
        'risks:read risks:write',
        ','
      );
      expect(mockExpandScopes).toHaveBeenCalledWith(['risks:read']);
      expect(mockHasAny).toHaveBeenCalledWith(expect.any(Set), ['risks:read']);
      expect(mockHandler).toHaveBeenCalledWith(req, res, next);
    });

    describe('error scenarios with HttpError', () => {
      it('should create HttpError with correct status and message for unauthenticated', async () => {
        const middleware = createAuthMiddleware(
          {
            requiredScopes: ['risks:read'],
          },
          mockHandler
        );
        const req = createMockRequest({ auth: undefined });
        const res = createMockResponse();
        const next = createMockNext();

        await middleware(req, res, next);

        const error = next.mock.calls[0]?.[0] as Error & { status: number };
        expect(error).toBeInstanceOf(Error);
        expect(error.status).toBe(401);
        expect(error.message).toBe('Unauthenticated');
        expect(mockHandler).not.toHaveBeenCalled();
      });

      it('should create HttpError with correct status and message for insufficient scope', async () => {
        mockHasAny.mockReturnValue(false);
        const middleware = createAuthMiddleware(
          {
            requiredScopes: ['risks:read'],
          },
          mockHandler
        );
        const req = createMockRequest({
          auth: {
            org_id: 'org123',
            tenant_id: 'tenant123',
            permissions: 'users:read',
          },
        });
        const res = createMockResponse();
        const next = createMockNext();

        await middleware(req, res, next);

        const error = next.mock.calls[0]?.[0] as Error & { status: number };
        expect(error).toBeInstanceOf(Error);
        expect(error.status).toBe(403);
        expect(error.message).toBe('Insufficient scope for this resource');
        expect(mockHandler).not.toHaveBeenCalled();
      });
    });
  });
});
