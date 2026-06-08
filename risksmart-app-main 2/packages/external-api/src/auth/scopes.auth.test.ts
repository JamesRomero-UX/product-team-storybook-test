import { beforeEach, vi } from 'vitest';

import type { ResourceScope, ResourceScopeKey } from './scopes';

// Mock resourceScopes to include write operations for testing
const mockResourceScopes = vi.hoisted(() => {
  const mockData: [string, ResourceScope][] = [
    [
      'account:read',
      {
        name: 'account:read' as ResourceScopeKey,
        desc: 'Read account',
        module: 'account',
      },
    ],
    [
      'documentation:read',
      {
        name: 'documentation:read' as ResourceScopeKey,
        desc: 'Read documentation',
        module: 'documentation',
      },
    ],
    [
      'risks:read',
      {
        name: 'risks:read' as ResourceScopeKey,
        desc: 'Read risks',
        module: 'risk',
      },
    ],
    [
      'risks:write',
      {
        name: 'risks:write' as ResourceScopeKey,
        desc: 'Write risks',
        module: 'risk',
      },
    ],
    [
      'risks:list',
      {
        name: 'risks:list' as ResourceScopeKey,
        desc: 'List risks',
        module: 'risk',
      },
    ],
    [
      'risks:get',
      {
        name: 'risks:get' as ResourceScopeKey,
        desc: 'Get risk',
        module: 'risk',
      },
    ],
    [
      'risks:create',
      {
        name: 'risks:create' as ResourceScopeKey,
        desc: 'Create risk',
        module: 'risk',
      },
    ],
    [
      'risks:update',
      {
        name: 'risks:update' as ResourceScopeKey,
        desc: 'Update risk',
        module: 'risk',
      },
    ],
    [
      'risks:delete',
      {
        name: 'risks:delete' as ResourceScopeKey,
        desc: 'Delete risk',
        module: 'risk',
      },
    ],
    [
      'users:read',
      {
        name: 'users:read' as ResourceScopeKey,
        desc: 'Read users',
        module: 'user',
      },
    ],
    [
      'users:write',
      {
        name: 'users:write' as ResourceScopeKey,
        desc: 'Write users',
        module: 'user',
      },
    ],
    [
      'users:list',
      {
        name: 'users:list' as ResourceScopeKey,
        desc: 'List users',
        module: 'user',
      },
    ],
    [
      'users:get',
      {
        name: 'users:get' as ResourceScopeKey,
        desc: 'Get user',
        module: 'user',
      },
    ],
    [
      'users:create',
      {
        name: 'users:create' as ResourceScopeKey,
        desc: 'Create user',
        module: 'user',
      },
    ],
    [
      'users:update',
      {
        name: 'users:update' as ResourceScopeKey,
        desc: 'Update user',
        module: 'user',
      },
    ],
    [
      'users:delete',
      {
        name: 'users:delete' as ResourceScopeKey,
        desc: 'Delete user',
        module: 'user',
      },
    ],
    [
      'controls:read',
      {
        name: 'controls:read' as ResourceScopeKey,
        desc: 'Read admin',
        module: 'control',
      },
    ],
    [
      'controls:write',
      {
        name: 'controls:write' as ResourceScopeKey,
        desc: 'Write admin',
        module: 'control',
      },
    ],
    [
      'controls:create',
      {
        name: 'controls:create' as ResourceScopeKey,
        desc: 'Create admin',
        module: 'control',
      },
    ],
    [
      'controls:update',
      {
        name: 'controls:update' as ResourceScopeKey,
        desc: 'Update admin',
        module: 'control',
      },
    ],
    [
      'controls:delete',
      {
        name: 'controls:delete' as ResourceScopeKey,
        desc: 'Delete admin',
        module: 'control',
      },
    ],
  ];

  return new Map(mockData);
});

vi.mock('./scopes', async () => {
  const actual =
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    await vi.importActual<typeof import('./scopes')>('./scopes');

  return {
    ...actual,
    resourceScopes: mockResourceScopes,
  };
});

import { expandScopes, hasAny, need, normalizeScopes } from './scopes.auth';

describe('scopes.auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe('normalizeScopes', () => {
    it('should return empty array for undefined input', () => {
      const result = normalizeScopes(undefined);
      expect(result).toEqual([]);
    });

    it('should return the same array if input is already an array', () => {
      const input = ['risks:read', 'risks:write'];
      const result = normalizeScopes(input);
      expect(result).toEqual(input);
    });

    it('should split space-separated string into array', () => {
      const input = 'risks:read risks:write controls:write';
      const result = normalizeScopes(input);
      expect(result).toEqual(['risks:read', 'risks:write', 'controls:write']);
    });

    it('should filter out empty strings from space-separated input', () => {
      const input = 'risks:read  risks:write   controls:write';
      const result = normalizeScopes(input);
      expect(result).toEqual(['risks:read', 'risks:write', 'controls:write']);
    });

    it('should handle empty string input', () => {
      const result = normalizeScopes('');
      expect(result).toEqual([]);
    });

    it('should handle string with only spaces', () => {
      const result = normalizeScopes('   ');
      expect(result).toEqual([]);
    });

    it('should handle single scope string', () => {
      const result = normalizeScopes('risks:read');
      expect(result).toEqual(['risks:read']);
    });
  });

  describe('expandScopes', () => {
    it('should return set with documentation:read and account:read for empty input', () => {
      const result = expandScopes([]);
      expect(result).toEqual(new Set(['documentation:read', 'account:read']));
    });

    it('should include original scopes in the result', () => {
      const input = ['risks:get', 'controls:write'] as ResourceScopeKey[];
      const result = expandScopes(input);
      expect(result.has('risks:get')).toBe(true);
      expect(result.has('documentation:read')).toBe(true);
      expect(result.has('account:read')).toBe(true);
    });

    it('should expand read scopes to include list and get', () => {
      const input = ['risks:read'] as ResourceScopeKey[];
      const result = expandScopes(input);
      expect(result.has('risks:read')).toBe(true);
      expect(result.has('risks:list')).toBe(true);
      expect(result.has('risks:get')).toBe(true);
    });

    it('should expand write scopes to include create, update, and delete', () => {
      const input = ['risks:write'] as unknown as ResourceScopeKey[];
      const result = expandScopes(input);
      expect(result.has('risks:write' as unknown as ResourceScopeKey)).toBe(
        true
      );
      expect(result.has('risks:create' as unknown as ResourceScopeKey)).toBe(
        true
      );
      expect(result.has('risks:update' as unknown as ResourceScopeKey)).toBe(
        true
      );
      expect(result.has('risks:delete' as unknown as ResourceScopeKey)).toBe(
        true
      );
    });

    it('should handle multiple scopes with different expansions', () => {
      const input = [
        'risks:read',
        'users:write',
        'controls:write',
      ] as unknown as ResourceScopeKey[];
      const result = expandScopes(input);

      // Original scopes
      expect(result.has('risks:read')).toBe(true);
      expect(result.has('users:write' as unknown as ResourceScopeKey)).toBe(
        true
      );
      expect(result.has('controls:write' as unknown as ResourceScopeKey)).toBe(
        true
      );

      // Risks read expansion
      expect(result.has('risks:list')).toBe(true);
      expect(result.has('risks:get')).toBe(true);

      // Users write expansion
      expect(result.has('users:create' as unknown as ResourceScopeKey)).toBe(
        true
      );
      expect(result.has('users:update' as unknown as ResourceScopeKey)).toBe(
        true
      );
      expect(result.has('users:delete' as unknown as ResourceScopeKey)).toBe(
        true
      );

      // Admin write expansion (write does not expand to read)
      expect(result.has('controls:create' as unknown as ResourceScopeKey)).toBe(
        true
      );
      expect(result.has('controls:update' as unknown as ResourceScopeKey)).toBe(
        true
      );
      expect(result.has('controls:delete' as unknown as ResourceScopeKey)).toBe(
        true
      );
    });

    it('should skip malformed scope strings', () => {
      const input = [
        'risks:read',
        'invalid-scope',
        'users:write',
        '',
      ] as unknown as ResourceScopeKey[];
      const result = expandScopes(input);

      expect(result.has('risks:read')).toBe(true);
      expect(result.has('risks:list')).toBe(true);
      expect(result.has('risks:get')).toBe(true);
      expect(result.has('users:write' as unknown as ResourceScopeKey)).toBe(
        true
      );
      expect(result.has('users:create' as unknown as ResourceScopeKey)).toBe(
        true
      );
      expect(result.has('invalid-scope' as unknown as ResourceScopeKey)).toBe(
        true
      );
      expect(result.has('' as unknown as ResourceScopeKey)).toBe(true);
      expect(result.has('documentation:read')).toBe(true);
      expect(result.has('account:read')).toBe(true);
    });

    it('should handle scopes with numbers and dots in resource name', () => {
      const input = ['my-resource.v2:read'] as unknown as ResourceScopeKey[];
      const result = expandScopes(input);
      expect(
        result.has('my-resource.v2:read' as unknown as ResourceScopeKey)
      ).toBe(true);
      expect(
        result.has('my-resource.v2:list' as unknown as ResourceScopeKey)
      ).toBe(false);
      expect(
        result.has('my-resource.v2:get' as unknown as ResourceScopeKey)
      ).toBe(false);
      expect(result.has('documentation:read')).toBe(true);
      expect(result.has('account:read')).toBe(true);
    });

    it('should handle case insensitive scope format matching regex but case sensitive action matching', () => {
      const input = [
        'RISKS:READ',
        'Users:Write',
      ] as unknown as ResourceScopeKey[];
      const result = expandScopes(input);
      // Original scopes are always included
      expect(result.has('RISKS:READ' as unknown as ResourceScopeKey)).toBe(
        true
      );
      expect(result.has('Users:Write' as unknown as ResourceScopeKey)).toBe(
        true
      );
      // But expansion only happens for lowercase actions since the implementation checks action === 'read'
      expect(result.has('RISKS:list' as unknown as ResourceScopeKey)).toBe(
        false
      );
      expect(result.has('RISKS:get' as unknown as ResourceScopeKey)).toBe(
        false
      );
      expect(result.has('Users:create' as unknown as ResourceScopeKey)).toBe(
        false
      );
      expect(result.has('Users:update' as unknown as ResourceScopeKey)).toBe(
        false
      );
      expect(result.has('Users:delete' as unknown as ResourceScopeKey)).toBe(
        false
      );
    });
  });

  describe('hasAny', () => {
    it('should return true when required scopes is empty', () => {
      const expanded = new Set([
        'risks:read',
        'users:write',
      ]) as Set<ResourceScopeKey>;
      const result = hasAny(expanded, []);
      expect(result).toBe(true);
    });

    it('should return true when all required scopes are present', () => {
      const expanded = new Set([
        'risks:read',
        'risks:write',
        'users:read',
      ]) as Set<ResourceScopeKey>;
      const required = ['risks:read', 'users:read'] as ResourceScopeKey[];
      const result = hasAny(expanded, required);
      expect(result).toBe(true);
    });

    it('should return true when at least one required scope is present', () => {
      const expanded = new Set([
        'risks:read',
        'users:write',
      ]) as Set<ResourceScopeKey>;
      const required = ['risks:read', 'controls:write'] as ResourceScopeKey[];
      const result = hasAny(expanded, required);
      expect(result).toBe(true);
    });

    it('should return false when no required scopes are present', () => {
      const expanded = new Set([
        'risks:read',
        'users:write',
      ]) as Set<ResourceScopeKey>;
      const required = [
        'controls:read',
        'controls:write',
      ] as unknown as ResourceScopeKey[];
      const result = hasAny(expanded, required);
      expect(result).toBe(false);
    });

    it('should return false when expanded set is empty', () => {
      const expanded = new Set([]);
      const required = ['risks:read'] as ResourceScopeKey[];
      const result = hasAny(expanded, required);
      expect(result).toBe(false);
    });

    it('should handle case sensitive matching', () => {
      const expanded = new Set([
        'risks:read',
        'users:write',
      ]) as Set<ResourceScopeKey>;
      const required = ['RISKS:READ'] as unknown as ResourceScopeKey[];
      const result = hasAny(expanded, required);
      expect(result).toBe(false);
    });
  });

  describe('need helper', () => {
    describe('read', () => {
      it('should return correct configuration for read list permissions', () => {
        const result = need.list('risks');
        expect(result).toEqual({
          requiredScopes: ['risks:read', 'risks:list'],
        });
      });

      it('should return correct configuration for read get permissions', () => {
        const result = need.get('risks');
        expect(result).toEqual({
          requiredScopes: ['risks:read', 'risks:get'],
        });
      });

      it('should work with different resource names', () => {
        const result = need.get('users');
        expect(result).toEqual({
          requiredScopes: ['users:read', 'users:get'],
        });
      });
    });

    describe('create', () => {
      it('should return correct configuration for create permissions', () => {
        const result = need.create('risks');
        expect(result).toEqual({
          requiredScopes: ['risks:write', 'risks:create'],
        });
      });

      it('should work with different resource names', () => {
        const result = need.create('users');
        expect(result).toEqual({
          requiredScopes: ['users:write', 'users:create'],
        });
      });

      it('should throw for an invalid resource scope', () => {
        expect(() =>
          need.create('nonexistent' as Parameters<typeof need.create>[0])
        ).toThrow('scope key nonexistent:write not found in resource scopes');
      });
    });

    describe('act', () => {
      it('should return correct configuration for get action', () => {
        const result = need.act('risks', 'get');
        expect(result).toEqual({
          requiredScopes: ['risks:get'],
        });
      });

      it('should return correct configuration for list action', () => {
        const result = need.act('risks', 'list');
        expect(result).toEqual({
          requiredScopes: ['risks:list'],
        });
      });

      it('should return correct configuration for create action', () => {
        const result = need.act('risks', 'create');
        expect(result).toEqual({
          requiredScopes: ['risks:create'],
        });
      });

      it('should return correct configuration for update action', () => {
        const result = need.act('risks', 'update');
        expect(result).toEqual({
          requiredScopes: ['risks:update'],
        });
      });

      it('should return correct configuration for delete action', () => {
        const result = need.act('risks', 'delete');
        expect(result).toEqual({
          requiredScopes: ['risks:delete'],
        });
      });

      it('should work with different resource names', () => {
        const result = need.act('users', 'create');
        expect(result).toEqual({
          requiredScopes: ['users:create'],
        });
      });
    });
  });
});
