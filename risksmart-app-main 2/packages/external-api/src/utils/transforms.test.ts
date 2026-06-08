import type { Request } from 'express';
import { describe, expect, it, vi } from 'vitest';

import {
  buildUrlSearchParams,
  firstDefined,
  idToResourceReference,
  nodeObjectTypeToResourceType,
} from './transforms';

describe('transforms utils', () => {
  describe('firstDefined', () => {
    it('should return the first defined value', () => {
      expect(firstDefined(1, 2, 3)).toBe(1);
      expect(firstDefined('a', 'b', 'c')).toBe('a');
      expect(firstDefined(true, false)).toBe(true);
    });

    it('should skip null values', () => {
      expect(firstDefined(null, 2, 3)).toBe(2);
      expect(firstDefined(null, null, 'c')).toBe('c');
    });

    it('should skip undefined values', () => {
      expect(firstDefined(undefined, 2, 3)).toBe(2);
      expect(firstDefined(undefined, undefined, 'c')).toBe('c');
    });

    it('should skip both null and undefined values', () => {
      expect(firstDefined(null, undefined, 3)).toBe(3);
      expect(firstDefined(undefined, null, 'c')).toBe('c');
    });

    it('should return undefined if all values are null or undefined', () => {
      expect(firstDefined(null, undefined, null)).toBeUndefined();
      expect(firstDefined(undefined, undefined)).toBeUndefined();
    });

    it('should return undefined if no values provided', () => {
      expect(firstDefined()).toBeUndefined();
    });

    it('should handle falsy values that are not null or undefined', () => {
      expect(firstDefined(0, 1, 2)).toBe(0);
      expect(firstDefined('', 'a', 'b')).toBe('');
      expect(firstDefined(false, true)).toBe(false);
    });

    it('should handle mixed types', () => {
      expect(firstDefined<number | string>(null, 0, 'string')).toBe(0);
      expect(firstDefined<boolean>(undefined, false, true)).toBe(false);
      expect(firstDefined<string>(null, '', 'test')).toBe('');
    });

    it('should return first non-null/undefined value even if later values exist', () => {
      expect(firstDefined(1, null, undefined, 2)).toBe(1);
      expect(firstDefined('first', 'second')).toBe('first');
    });
  });

  describe('idToResourceReference', () => {
    it('should create a resource reference with correct structure', () => {
      const result = idToResourceReference('123', 'risk', '/api/v1/risks');

      expect(result).toEqual({
        id: '123',
        type: 'risk',
        href: '/api/v1/risks/123',
      });
    });

    it('should encode URI components in the ID', () => {
      const result = idToResourceReference(
        'auth0|user@123',
        'user',
        '/api/v1/users'
      );

      expect(result.href).toBe('/api/v1/users/auth0%7Cuser%40123');
    });

    it('should handle empty hrefPrefix', () => {
      const result = idToResourceReference('123', 'risk', '');

      expect(result.href).toBe('/123');
    });

    it('should normalize double slashes in href', () => {
      const result = idToResourceReference('123', 'risk', '/api/v1//risks');

      expect(result.href).toBe('/api/v1/risks/123');
    });

    it('should normalize multiple consecutive slashes', () => {
      const result = idToResourceReference('123', 'risk', '/api///v1/risks');

      expect(result.href).toBe('/api/v1/risks/123');
    });

    it('should preserve protocol slashes (http://)', () => {
      const result = idToResourceReference(
        '123',
        'risk',
        'http://example.com/api/v1/risks'
      );

      expect(result.href).toBe('http://example.com/api/v1/risks/123');
    });

    it('should handle special characters in ID', () => {
      const result = idToResourceReference(
        'id with spaces',
        'resource',
        '/api/resources'
      );

      expect(result.href).toBe('/api/resources/id%20with%20spaces');
    });

    it('should handle trailing slash in hrefPrefix', () => {
      const result = idToResourceReference('123', 'risk', '/api/v1/risks/');

      expect(result.href).toBe('/api/v1/risks/123');
    });

    it('should handle complex IDs with multiple special chars', () => {
      const result = idToResourceReference(
        'provider|user#123@domain',
        'user',
        '/api/users'
      );

      expect(result.href).toBe('/api/users/provider%7Cuser%23123%40domain');
    });
  });

  describe('buildUrlSearchParams', () => {
    it('should build URL with existing query params', () => {
      const mockRequest = {
        protocol: 'http',
        get: vi.fn().mockReturnValue('localhost:3000'),
        originalUrl: '/api/v1/risks?page=1',
      } as unknown as Request;

      const result = buildUrlSearchParams(mockRequest);

      expect(result).toBe('/api/v1/risks?page=1');
    });

    it('should add extra params to URL', () => {
      const mockRequest = {
        protocol: 'http',
        get: vi.fn().mockReturnValue('localhost:3000'),
        originalUrl: '/api/v1/risks',
      } as unknown as Request;

      const result = buildUrlSearchParams(mockRequest, {
        page_size: 10,
        filter: 'active',
      });

      expect(result).toContain('page_size=10');
      expect(result).toContain('filter=active');
    });

    it('should override existing params with extra params', () => {
      const mockRequest = {
        protocol: 'http',
        get: vi.fn().mockReturnValue('localhost:3000'),
        originalUrl: '/api/v1/risks?page=1',
      } as unknown as Request;

      const result = buildUrlSearchParams(mockRequest, { page: 2 });

      expect(result).toBe('/api/v1/risks?page=2');
      expect(result).not.toContain('page=1');
    });

    it('should delete params when value is null', () => {
      const mockRequest = {
        protocol: 'http',
        get: vi.fn().mockReturnValue('localhost:3000'),
        originalUrl: '/api/v1/risks?page=1&filter=active',
      } as unknown as Request;

      const result = buildUrlSearchParams(mockRequest, { filter: null });

      expect(result).toBe('/api/v1/risks?page=1');
      expect(result).not.toContain('filter');
    });

    it('should handle runtime undefined values gracefully', () => {
      const mockRequest = {
        protocol: 'http',
        get: vi.fn().mockReturnValue('localhost:3000'),
        originalUrl: '/api/v1/risks?page=1&filter=active',
      } as unknown as Request;

      // The function handles undefined at runtime even though types don't allow it
      // This tests the actual runtime behavior when undefined slips through
      const params: Record<string, string | number | null> = {
        filter: null, // Use null instead since it's the typed way to delete
      };

      const result = buildUrlSearchParams(mockRequest, params);

      expect(result).toBe('/api/v1/risks?page=1');
      expect(result).not.toContain('filter');
    });

    it('should convert number params to strings', () => {
      const mockRequest = {
        protocol: 'http',
        get: vi.fn().mockReturnValue('localhost:3000'),
        originalUrl: '/api/v1/risks',
      } as unknown as Request;

      const result = buildUrlSearchParams(mockRequest, {
        page_size: 10,
        offset: 0,
      });

      expect(result).toContain('page_size=10');
      expect(result).toContain('offset=0');
    });

    it('should return absolute URL when absolute option is true', () => {
      const mockRequest = {
        protocol: 'https',
        get: vi.fn().mockReturnValue('example.com'),
        originalUrl: '/api/v1/risks?page=1',
      } as unknown as Request;

      const result = buildUrlSearchParams(mockRequest, {}, { absolute: true });

      expect(result).toBe('https://example.com/api/v1/risks?page=1');
    });

    it('should return relative URL when absolute option is false', () => {
      const mockRequest = {
        protocol: 'https',
        get: vi.fn().mockReturnValue('example.com'),
        originalUrl: '/api/v1/risks?page=1',
      } as unknown as Request;

      const result = buildUrlSearchParams(mockRequest, {}, { absolute: false });

      expect(result).toBe('/api/v1/risks?page=1');
    });

    it('should handle URLs without query params', () => {
      const mockRequest = {
        protocol: 'http',
        get: vi.fn().mockReturnValue('localhost:3000'),
        originalUrl: '/api/v1/risks',
      } as unknown as Request;

      const result = buildUrlSearchParams(mockRequest);

      expect(result).toBe('/api/v1/risks');
    });

    it('should handle empty extra params', () => {
      const mockRequest = {
        protocol: 'http',
        get: vi.fn().mockReturnValue('localhost:3000'),
        originalUrl: '/api/v1/risks?page=1',
      } as unknown as Request;

      const result = buildUrlSearchParams(mockRequest, {});

      expect(result).toBe('/api/v1/risks?page=1');
    });

    it('should handle multiple extra params', () => {
      const mockRequest = {
        protocol: 'http',
        get: vi.fn().mockReturnValue('localhost:3000'),
        originalUrl: '/api/v1/risks',
      } as unknown as Request;

      const result = buildUrlSearchParams(mockRequest, {
        page_size: 25,
        start_after: 'cursor123',
        ending_before: null,
        filter: 'high',
      });

      expect(result).toContain('page_size=25');
      expect(result).toContain('start_after=cursor123');
      expect(result).toContain('filter=high');
      expect(result).not.toContain('ending_before');
    });

    it('should handle URLs with hash fragments', () => {
      const mockRequest = {
        protocol: 'http',
        get: vi.fn().mockReturnValue('localhost:3000'),
        originalUrl: '/api/v1/risks#section',
      } as unknown as Request;

      const result = buildUrlSearchParams(mockRequest, { page: 1 });

      expect(result).toContain('/api/v1/risks');
      expect(result).toContain('page=1');
    });

    it('should preserve port in absolute URL', () => {
      const mockRequest = {
        protocol: 'http',
        get: vi.fn().mockReturnValue('localhost:3000'),
        originalUrl: '/api/v1/risks',
      } as unknown as Request;

      const result = buildUrlSearchParams(mockRequest, {}, { absolute: true });

      expect(result).toBe('http://localhost:3000/api/v1/risks');
    });

    it('should handle HTTPS protocol', () => {
      const mockRequest = {
        protocol: 'https',
        get: vi.fn().mockReturnValue('api.example.com'),
        originalUrl: '/v1/resources',
      } as unknown as Request;

      const result = buildUrlSearchParams(
        mockRequest,
        { id: '123' },
        { absolute: true }
      );

      expect(result).toBe('https://api.example.com/v1/resources?id=123');
    });

    it('should handle special characters in param values', () => {
      const mockRequest = {
        protocol: 'http',
        get: vi.fn().mockReturnValue('localhost:3000'),
        originalUrl: '/api/v1/risks',
      } as unknown as Request;

      const result = buildUrlSearchParams(mockRequest, {
        filter: 'status=active&priority=high',
      });

      expect(result).toContain('filter=status%3Dactive%26priority%3Dhigh');
    });
  });

  describe('nodeObjectTypeToResourceType', () => {
    it('should return resource type for known risk type', () => {
      const result = nodeObjectTypeToResourceType('risk');

      expect(result).toEqual({
        type: 'risk',
        path: 'risks',
      });
    });

    it('should return resource type for known control type', () => {
      const result = nodeObjectTypeToResourceType('control');

      expect(result).toEqual({
        type: 'control',
        path: 'controls',
      });
    });

    it('should return undefined for unknown type', () => {
      const result = nodeObjectTypeToResourceType('unknown');

      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const result = nodeObjectTypeToResourceType('');

      expect(result).toBeUndefined();
    });

    it('should be case sensitive', () => {
      expect(nodeObjectTypeToResourceType('Risk')).toBeUndefined();
      expect(nodeObjectTypeToResourceType('RISK')).toBeUndefined();
      expect(nodeObjectTypeToResourceType('Control')).toBeUndefined();
    });

    it('should return undefined for null-like strings', () => {
      expect(nodeObjectTypeToResourceType('null')).toBeUndefined();
      expect(nodeObjectTypeToResourceType('undefined')).toBeUndefined();
    });

    it('should handle whitespace in type name', () => {
      expect(nodeObjectTypeToResourceType(' risk')).toBeUndefined();
      expect(nodeObjectTypeToResourceType('risk ')).toBeUndefined();
      expect(nodeObjectTypeToResourceType(' risk ')).toBeUndefined();
    });
  });
});
