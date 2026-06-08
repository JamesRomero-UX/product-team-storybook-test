import type { AllowedScope } from 'src/providers/ExternalApiProvider';
import { describe, expect, it } from 'vitest';

import type { ScopeInfo } from './scopeParser';
import {
  getAllReadScopes,
  getAllWriteScopes,
  getPrimaryResources,
  groupScopesByResource,
  parseScopeName,
  RESOURCE_DISPLAY_NAMES,
} from './scopeParser';

// ============================================================================
// Common Mock Data
// ============================================================================

const createMockScope = (name: string, desc: string = ''): AllowedScope => ({
  name,
  desc,
});

// Common scopes for testing
const mockRisksScopes: AllowedScope[] = [
  createMockScope('risks:list', 'List all risks'),
  createMockScope('risks:get', 'Get a risk'),
  createMockScope('risks:create', 'Create a risk'),
  createMockScope('risks:update', 'Update a risk'),
  createMockScope('risks:delete', 'Delete a risk'),
];

const mockRisksWithSubresources: AllowedScope[] = [
  ...mockRisksScopes,
  createMockScope('risks.ratings:get', 'Get risk ratings'),
  createMockScope('risks.ratings:update', 'Update risk ratings'),
  createMockScope('risks.impacts:list', 'List risk impacts'),
  createMockScope('risks.impacts:get', 'Get risk impacts'),
];

const mockMultipleResources: AllowedScope[] = [
  createMockScope('risks:list', 'List risks'),
  createMockScope('risks:get', 'Get a risk'),
  createMockScope('controls:list', 'List controls'),
  createMockScope('controls:create', 'Create a control'),
  createMockScope('issues:get', 'Get an issue'),
  createMockScope('issues:delete', 'Delete an issue'),
];

const mockExcludedResources: AllowedScope[] = [
  createMockScope('auth-client:list', 'List auth clients'),
  createMockScope('documentation:read', 'Read documentation'),
  createMockScope('account:get', 'Get account'),
  createMockScope('risks:list', 'List risks'),
];

// ============================================================================
// Tests
// ============================================================================

describe('scopeParser', () => {
  describe('parseScopeName', () => {
    describe('Happy Path', () => {
      it('should parse a simple scope with resource and action', () => {
        const result = parseScopeName('risks:list');

        expect(result).toEqual<ScopeInfo>({
          fullScope: 'risks:list',
          resource: 'risks',
          subresource: null,
          action: 'list',
        });
      });

      it('should parse a scope with subresource', () => {
        const result = parseScopeName('risks.ratings:get');

        expect(result).toEqual<ScopeInfo>({
          fullScope: 'risks.ratings:get',
          resource: 'risks',
          subresource: 'ratings',
          action: 'get',
        });
      });

      it('should parse a scope with nested subresource', () => {
        const result = parseScopeName('risks.ratings.history:list');

        expect(result).toEqual<ScopeInfo>({
          fullScope: 'risks.ratings.history:list',
          resource: 'risks',
          subresource: 'ratings.history',
          action: 'list',
        });
      });

      it('should parse a scope with hyphenated resource name', () => {
        const result = parseScopeName('enterprise-risks:create');

        expect(result).toEqual<ScopeInfo>({
          fullScope: 'enterprise-risks:create',
          resource: 'enterprise-risks',
          subresource: null,
          action: 'create',
        });
      });

      it('should parse a scope with hyphenated subresource name', () => {
        const result = parseScopeName('third-parties.risk-assessments:update');

        expect(result).toEqual<ScopeInfo>({
          fullScope: 'third-parties.risk-assessments:update',
          resource: 'third-parties',
          subresource: 'risk-assessments',
          action: 'update',
        });
      });
    });

    describe('Edge Cases', () => {
      it('should handle scope without colon', () => {
        const result = parseScopeName('invalid');

        expect(result).toEqual<ScopeInfo>({
          fullScope: 'invalid',
          resource: 'invalid',
          subresource: null,
          action: undefined as unknown as string,
        });
      });

      it('should handle empty string', () => {
        const result = parseScopeName('');

        expect(result).toEqual<ScopeInfo>({
          fullScope: '',
          resource: '',
          subresource: null,
          action: undefined as unknown as string,
        });
      });

      it('should handle scope with multiple colons', () => {
        const result = parseScopeName('risks:list:extra');

        expect(result).toEqual<ScopeInfo>({
          fullScope: 'risks:list:extra',
          resource: 'risks',
          subresource: null,
          action: 'list',
        });
      });
    });
  });

  describe('groupScopesByResource', () => {
    describe('Happy Path', () => {
      it('should group scopes by resource', () => {
        const result = groupScopesByResource(mockRisksScopes);

        expect(Object.keys(result)).toEqual(['risks']);
        expect(result['risks'].resource).toBe('risks');
        expect(result['risks'].displayName).toBe('Risks');
        expect(result['risks'].topLevelScopes).toHaveLength(5);
      });

      it('should set hasRead to true when list action exists', () => {
        const scopes = [createMockScope('risks:list', 'List risks')];
        const result = groupScopesByResource(scopes);

        expect(result['risks'].hasRead).toBe(true);
        expect(result['risks'].hasWrite).toBe(false);
      });

      it('should set hasRead to true when get action exists', () => {
        const scopes = [createMockScope('risks:get', 'Get a risk')];
        const result = groupScopesByResource(scopes);

        expect(result['risks'].hasRead).toBe(true);
        expect(result['risks'].hasWrite).toBe(false);
      });

      it('should set hasWrite to true when create action exists', () => {
        const scopes = [createMockScope('risks:create', 'Create a risk')];
        const result = groupScopesByResource(scopes);

        expect(result['risks'].hasRead).toBe(false);
        expect(result['risks'].hasWrite).toBe(true);
      });

      it('should set hasWrite to true when update action exists', () => {
        const scopes = [createMockScope('risks:update', 'Update a risk')];
        const result = groupScopesByResource(scopes);

        expect(result['risks'].hasWrite).toBe(true);
      });

      it('should set hasWrite to true when delete action exists', () => {
        const scopes = [createMockScope('risks:delete', 'Delete a risk')];
        const result = groupScopesByResource(scopes);

        expect(result['risks'].hasWrite).toBe(true);
      });

      it('should group subresources correctly', () => {
        const result = groupScopesByResource(mockRisksWithSubresources);

        expect(result['risks'].subresourceGroups).toHaveLength(2);

        const ratingsGroup = result['risks'].subresourceGroups.find(
          (g) => g.name === 'ratings'
        );
        expect(ratingsGroup).toBeDefined();
        expect(ratingsGroup?.scopes).toHaveLength(2);

        const impactsGroup = result['risks'].subresourceGroups.find(
          (g) => g.name === 'impacts'
        );
        expect(impactsGroup).toBeDefined();
        expect(impactsGroup?.scopes).toHaveLength(2);
      });

      it('should sort subresource groups alphabetically', () => {
        const result = groupScopesByResource(mockRisksWithSubresources);

        const groupNames = result['risks'].subresourceGroups.map((g) => g.name);
        expect(groupNames).toEqual(['impacts', 'ratings']);
      });

      it('should format subresource display names correctly', () => {
        const scopes = [
          createMockScope('risks.risk-assessments:get', 'Get risk assessments'),
        ];
        const result = groupScopesByResource(scopes);

        const group = result['risks'].subresourceGroups[0];
        expect(group.displayName).toBe('Risk Assessments');
      });

      it('should group multiple resources separately', () => {
        const result = groupScopesByResource(mockMultipleResources);

        expect(Object.keys(result).sort()).toEqual([
          'controls',
          'issues',
          'risks',
        ]);
        expect(result['risks'].topLevelScopes).toHaveLength(2);
        expect(result['controls'].topLevelScopes).toHaveLength(2);
        expect(result['issues'].topLevelScopes).toHaveLength(2);
      });
    });

    describe('Excluded Resources', () => {
      it('should exclude auth-client resource', () => {
        const result = groupScopesByResource(mockExcludedResources);

        expect(result['auth-client']).toBeUndefined();
      });

      it('should exclude documentation resource', () => {
        const result = groupScopesByResource(mockExcludedResources);

        expect(result['documentation']).toBeUndefined();
      });

      it('should exclude account resource', () => {
        const result = groupScopesByResource(mockExcludedResources);

        expect(result['account']).toBeUndefined();
      });

      it('should include non-excluded resources', () => {
        const result = groupScopesByResource(mockExcludedResources);

        expect(result['risks']).toBeDefined();
        expect(Object.keys(result)).toEqual(['risks']);
      });
    });

    describe('Display Names', () => {
      it('should use mapped display name for known resources', () => {
        const scopes = [createMockScope('enterprise-risks:list', 'List')];
        const result = groupScopesByResource(scopes);

        expect(result['enterprise-risks'].displayName).toBe('Enterprise Risks');
      });

      it('should use mapped display name for third-parties', () => {
        const scopes = [createMockScope('third-parties:list', 'List')];
        const result = groupScopesByResource(scopes);

        expect(result['third-parties'].displayName).toBe('Third Parties');
      });

      it('should format display name for unknown resources', () => {
        const scopes = [createMockScope('custom-resource:list', 'List')];
        const result = groupScopesByResource(scopes);

        expect(result['custom-resource'].displayName).toBe('Custom Resource');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty scopes array', () => {
        const result = groupScopesByResource([]);

        expect(result).toEqual({});
      });

      it('should handle scopes with only excluded resources', () => {
        const scopes = [
          createMockScope('auth-client:list', 'List'),
          createMockScope('documentation:read', 'Read'),
        ];
        const result = groupScopesByResource(scopes);

        expect(result).toEqual({});
      });
    });
  });

  describe('getAllReadScopes', () => {
    describe('Happy Path', () => {
      it('should return list and get scopes for a resource', () => {
        const result = getAllReadScopes('risks', mockRisksScopes);

        expect(result).toEqual(['risks:list', 'risks:get']);
      });

      it('should include subresource read scopes', () => {
        const result = getAllReadScopes('risks', mockRisksWithSubresources);

        expect(result).toContain('risks:list');
        expect(result).toContain('risks:get');
        expect(result).toContain('risks.ratings:get');
        expect(result).toContain('risks.impacts:list');
        expect(result).toContain('risks.impacts:get');
      });

      it('should not include write scopes', () => {
        const result = getAllReadScopes('risks', mockRisksScopes);

        expect(result).not.toContain('risks:create');
        expect(result).not.toContain('risks:update');
        expect(result).not.toContain('risks:delete');
      });
    });

    describe('Edge Cases', () => {
      it('should return empty array for non-existent resource', () => {
        const result = getAllReadScopes('nonexistent', mockRisksScopes);

        expect(result).toEqual([]);
      });

      it('should return empty array for empty scopes', () => {
        const result = getAllReadScopes('risks', []);

        expect(result).toEqual([]);
      });

      it('should return empty array for resource with only write scopes', () => {
        const writeOnlyScopes = [
          createMockScope('risks:create', 'Create'),
          createMockScope('risks:update', 'Update'),
          createMockScope('risks:delete', 'Delete'),
        ];
        const result = getAllReadScopes('risks', writeOnlyScopes);

        expect(result).toEqual([]);
      });
    });
  });

  describe('getAllWriteScopes', () => {
    describe('Happy Path', () => {
      it('should return create, update, and delete scopes for a resource', () => {
        const result = getAllWriteScopes('risks', mockRisksScopes);

        expect(result).toEqual([
          'risks:create',
          'risks:update',
          'risks:delete',
        ]);
      });

      it('should include subresource write scopes', () => {
        const result = getAllWriteScopes('risks', mockRisksWithSubresources);

        expect(result).toContain('risks:create');
        expect(result).toContain('risks:update');
        expect(result).toContain('risks:delete');
        expect(result).toContain('risks.ratings:update');
      });

      it('should not include read scopes', () => {
        const result = getAllWriteScopes('risks', mockRisksScopes);

        expect(result).not.toContain('risks:list');
        expect(result).not.toContain('risks:get');
      });
    });

    describe('Edge Cases', () => {
      it('should return empty array for non-existent resource', () => {
        const result = getAllWriteScopes('nonexistent', mockRisksScopes);

        expect(result).toEqual([]);
      });

      it('should return empty array for empty scopes', () => {
        const result = getAllWriteScopes('risks', []);

        expect(result).toEqual([]);
      });

      it('should return empty array for resource with only read scopes', () => {
        const readOnlyScopes = [
          createMockScope('risks:list', 'List'),
          createMockScope('risks:get', 'Get'),
        ];
        const result = getAllWriteScopes('risks', readOnlyScopes);

        expect(result).toEqual([]);
      });
    });
  });

  describe('getPrimaryResources', () => {
    describe('Happy Path', () => {
      it('should return unique resource names', () => {
        const result = getPrimaryResources(mockRisksScopes);

        expect(result).toEqual(['risks']);
      });

      it('should return multiple resources sorted alphabetically', () => {
        const result = getPrimaryResources(mockMultipleResources);

        expect(result).toEqual(['controls', 'issues', 'risks']);
      });

      it('should not include duplicate resources', () => {
        const scopes = [
          createMockScope('risks:list', 'List'),
          createMockScope('risks:get', 'Get'),
          createMockScope('risks:create', 'Create'),
        ];
        const result = getPrimaryResources(scopes);

        expect(result).toEqual(['risks']);
      });
    });

    describe('Excluded Resources', () => {
      it('should exclude auth-client from primary resources', () => {
        const result = getPrimaryResources(mockExcludedResources);

        expect(result).not.toContain('auth-client');
      });

      it('should exclude documentation from primary resources', () => {
        const result = getPrimaryResources(mockExcludedResources);

        expect(result).not.toContain('documentation');
      });

      it('should exclude account from primary resources', () => {
        const result = getPrimaryResources(mockExcludedResources);

        expect(result).not.toContain('account');
      });

      it('should return only non-excluded resources', () => {
        const result = getPrimaryResources(mockExcludedResources);

        expect(result).toEqual(['risks']);
      });
    });

    describe('Edge Cases', () => {
      it('should return empty array for empty scopes', () => {
        const result = getPrimaryResources([]);

        expect(result).toEqual([]);
      });

      it('should return empty array when all resources are excluded', () => {
        const scopes = [
          createMockScope('auth-client:list', 'List'),
          createMockScope('documentation:read', 'Read'),
          createMockScope('account:get', 'Get'),
        ];
        const result = getPrimaryResources(scopes);

        expect(result).toEqual([]);
      });

      it('should handle resources from subresource scopes', () => {
        const scopes = [createMockScope('risks.ratings:get', 'Get ratings')];
        const result = getPrimaryResources(scopes);

        expect(result).toEqual(['risks']);
      });
    });
  });

  describe('RESOURCE_DISPLAY_NAMES', () => {
    it('should have display names for common resources', () => {
      expect(RESOURCE_DISPLAY_NAMES['risks']).toBe('Risks');
      expect(RESOURCE_DISPLAY_NAMES['controls']).toBe('Controls');
      expect(RESOURCE_DISPLAY_NAMES['issues']).toBe('Issues');
      expect(RESOURCE_DISPLAY_NAMES['policies']).toBe('Policies');
    });

    it('should have display names for hyphenated resources', () => {
      expect(RESOURCE_DISPLAY_NAMES['enterprise-risks']).toBe(
        'Enterprise Risks'
      );
      expect(RESOURCE_DISPLAY_NAMES['third-parties']).toBe('Third Parties');
    });
  });
});
