import { describe, expect, it } from 'vitest';

import type { ResourceScope, ResourceScopeKey } from '../../auth/scopes';
import type { ModuleConfig } from '../../schemas/organisation/organisationModule.schema';
import { resolveScopesFromConfig } from './organisation-module.transformer';

// Mock scopes with various module attributes
const mockScopes: ResourceScope[] = [
  { name: 'account:read', desc: 'Read account', module: 'account' },
  { name: 'risks:list', desc: 'List risks', module: 'risk' },
  { name: 'risks:get', desc: 'Get risk', module: 'risk' },
  { name: 'risks:read', desc: 'Read risks', module: 'risk' },
  {
    name: 'risks.impacts:list',
    desc: 'List risk impacts',
    module: 'risk.impact',
  },
  {
    name: 'risks.impacts:read',
    desc: 'Read risk impacts',
    module: 'risk.impact',
  },
  {
    name: 'risks.appetite:list',
    desc: 'List risk appetite',
    module: 'risk.appetite',
  },
  {
    name: 'risks.appetite:read',
    desc: 'Read risk appetite',
    module: 'risk.appetite',
  },
  {
    name: 'risks.acceptances:list',
    desc: 'List risk acceptances',
    module: 'risk.acceptance',
  },
  {
    name: 'risks.acceptances:read',
    desc: 'Read risk acceptances',
    module: 'risk.acceptance',
  },
  { name: 'issues:list', desc: 'List issues', module: 'issue' },
  { name: 'issues:get', desc: 'Get issue', module: 'issue' },
  {
    name: 'issues.causes:list',
    desc: 'List issue causes',
    module: 'issue.cause',
  },
  {
    name: 'issues.causes:read',
    desc: 'Read issue causes',
    module: 'issue.cause',
  },
  {
    name: 'issues.consequences:list',
    desc: 'List issue consequences',
    module: 'issue.consequence',
  },
  {
    name: 'issues.consequences:read',
    desc: 'Read issue consequences',
    module: 'issue.consequence',
  },
  { name: 'controls:list', desc: 'List controls', module: 'control' },
  { name: 'controls:get', desc: 'Get control', module: 'control' },
  { name: 'actions:list', desc: 'List actions', module: 'action' },
  { name: 'actions:read', desc: 'Read actions', module: 'action' },
  { name: 'indicators:list', desc: 'List indicators', module: 'indicator' },
  { name: 'indicators:read', desc: 'Read indicators', module: 'indicator' },
  { name: 'assessments:list', desc: 'List assessments', module: 'assessment' },
  { name: 'assessments:read', desc: 'Read assessments', module: 'assessment' },
  { name: 'obligations:list', desc: 'List obligations', module: 'obligation' },
  { name: 'obligations:read', desc: 'Read obligations', module: 'obligation' },
  { name: 'policies:list', desc: 'List policies', module: 'document' },
  { name: 'policies:read', desc: 'Read policies', module: 'document' },
  {
    name: 'third-parties:list',
    desc: 'List third parties',
    module: 'third_party',
  },
  {
    name: 'third-parties:read',
    desc: 'Read third parties',
    module: 'third_party',
  },
  {
    name: 'enterprise-risks:list',
    desc: 'List enterprise risks',
    module: 'enterprise_risk',
  },
  {
    name: 'enterprise-risks:read',
    desc: 'Read enterprise risks',
    module: 'enterprise_risk',
  },
  { name: 'users:get', desc: 'Get user', module: 'user' },
  { name: 'users:read', desc: 'Read users', module: 'user' },
  {
    name: 'documentation:read',
    desc: 'Read documentation',
    module: 'documentation',
  },
];

describe('organisation-module.transformer', () => {
  describe('resolveScopesFromConfig', () => {
    describe('happy path', () => {
      it('should return scopes for single enabled root module', () => {
        const config: ModuleConfig = {
          risk: { enabled: true },
        };

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result).toHaveLength(3);
        expect(result.map((s) => s.name)).toEqual([
          'risks:list',
          'risks:get',
          'risks:read',
        ]);
      });

      it('should return scopes for multiple enabled root modules', () => {
        const config: ModuleConfig = {
          risk: { enabled: true },
          issue: { enabled: true },
          control: { enabled: true },
        };

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result).toHaveLength(7);
        expect(result.map((s) => s.name)).toContain('risks:list');
        expect(result.map((s) => s.name)).toContain('issues:list');
        expect(result.map((s) => s.name)).toContain('controls:list');
      });

      it('should return scopes for enabled root module with enabled sub-module', () => {
        const config: ModuleConfig = {
          risk: {
            enabled: true,
            subModules: {
              impact: { enabled: true },
            },
          },
        };

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result).toHaveLength(5);
        expect(result.map((s) => s.name)).toContain('risks:list');
        expect(result.map((s) => s.name)).toContain('risks.impacts:list');
        expect(result.map((s) => s.name)).toContain('risks.impacts:read');
      });

      it('should return scopes for multiple enabled sub-modules', () => {
        const config: ModuleConfig = {
          risk: {
            enabled: true,
            subModules: {
              impact: { enabled: true },
              appetite: { enabled: true },
              acceptance: { enabled: true },
            },
          },
        };

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result).toHaveLength(9);
        expect(result.map((s) => s.name)).toContain('risks:list');
        expect(result.map((s) => s.name)).toContain('risks.impacts:list');
        expect(result.map((s) => s.name)).toContain('risks.appetite:list');
        expect(result.map((s) => s.name)).toContain('risks.acceptances:list');
      });

      it('should return scopes for nested sub-modules', () => {
        const config: ModuleConfig = {
          issue: {
            enabled: true,
            subModules: {
              cause: { enabled: true },
              consequence: { enabled: true },
            },
          },
        };

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result).toHaveLength(6);
        expect(result.map((s) => s.name)).toContain('issues:list');
        expect(result.map((s) => s.name)).toContain('issues.causes:list');
        expect(result.map((s) => s.name)).toContain('issues.consequences:list');
      });

      it('should return scopes for complex nested config', () => {
        const config: ModuleConfig = {
          risk: {
            enabled: true,
            subModules: {
              impact: { enabled: true },
              appetite: { enabled: false },
            },
          },
          issue: {
            enabled: true,
            subModules: {
              cause: { enabled: true },
            },
          },
        };

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result).toHaveLength(9);
        expect(result.map((s) => s.name)).toContain('risks:list');
        expect(result.map((s) => s.name)).toContain('risks.impacts:list');
        expect(result.map((s) => s.name)).toContain('issues:list');
        expect(result.map((s) => s.name)).toContain('issues.causes:list');
        expect(result.map((s) => s.name)).not.toContain('risks.appetite:list');
      });

      it('should deduplicate scopes by name', () => {
        const config: ModuleConfig = {
          risk: { enabled: true },
        };

        const duplicateScopes: ResourceScope[] = [
          ...mockScopes,
          { name: 'risks:list', desc: 'Duplicate', module: 'risk' },
        ];

        const result = resolveScopesFromConfig(config, duplicateScopes);

        const riskListScopes = result.filter((s) => s.name === 'risks:list');
        expect(riskListScopes).toHaveLength(1);
      });

      it('should handle all modules enabled', () => {
        const config: ModuleConfig = {
          account: { enabled: true },
          risk: { enabled: true },
          issue: { enabled: true },
          control: { enabled: true },
          action: { enabled: true },
          indicator: { enabled: true },
          assessment: { enabled: true },
          obligation: { enabled: true },
          document: { enabled: true },
          third_party: { enabled: true },
          enterprise_risk: { enabled: true },
          user: { enabled: true },
          documentation: { enabled: true },
        };

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result.length).toBeGreaterThan(0);
        expect(result.length).toBeLessThanOrEqual(mockScopes.length);
      });
    });

    describe('disabled modules', () => {
      it('should not return scopes for disabled root module', () => {
        const config: ModuleConfig = {
          risk: { enabled: false },
        };

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result).toHaveLength(0);
      });

      it('should not return scopes for disabled sub-module', () => {
        const config: ModuleConfig = {
          risk: {
            enabled: true,
            subModules: {
              impact: { enabled: false },
            },
          },
        };

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result.map((s) => s.name)).toContain('risks:list');
        expect(result.map((s) => s.name)).not.toContain('risks.impacts:list');
      });

      it('should not return scopes when parent module is disabled but sub-module is enabled', () => {
        const config: ModuleConfig = {
          risk: {
            enabled: false,
            subModules: {
              impact: { enabled: true },
            },
          },
        };

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result).toHaveLength(0);
      });

      it('should handle mix of enabled and disabled modules', () => {
        const config: ModuleConfig = {
          risk: { enabled: true },
          issue: { enabled: false },
          control: { enabled: true },
        };

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result.map((s) => s.name)).toContain('risks:list');
        expect(result.map((s) => s.name)).toContain('controls:list');
        expect(result.map((s) => s.name)).not.toContain('issues:list');
      });
    });

    describe('edge cases', () => {
      it('should return empty array when config is empty', () => {
        const config: ModuleConfig = {};

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result).toEqual([]);
      });

      it('should return empty array when allScopes is empty', () => {
        const config: ModuleConfig = {
          risk: { enabled: true },
        };

        const result = resolveScopesFromConfig(config, []);

        expect(result).toEqual([]);
      });

      it('should return empty array when no modules are enabled', () => {
        const config: ModuleConfig = {
          risk: { enabled: false },
          issue: { enabled: false },
          control: { enabled: false },
        };

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result).toEqual([]);
      });

      it('should handle module with no matching scopes', () => {
        const config: ModuleConfig = {
          nonexistent: { enabled: true },
        };

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result).toEqual([]);
      });

      it('should handle module with allowTabConfig property', () => {
        const config: ModuleConfig = {
          risk: {
            enabled: true,
            allowTabConfig: true,
          },
        };

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result).toHaveLength(3);
        expect(result.map((s) => s.name)).toContain('risks:list');
      });

      it('should handle deeply nested sub-modules', () => {
        const config: ModuleConfig = {
          risk: {
            enabled: true,
            subModules: {
              impact: {
                enabled: true,
                subModules: {
                  nested: { enabled: true },
                },
              },
            },
          },
        };

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result.map((s) => s.name)).toContain('risks:list');
        expect(result.map((s) => s.name)).toContain('risks.impacts:list');
      });

      it('should handle empty sub-modules object', () => {
        const config: ModuleConfig = {
          risk: {
            enabled: true,
            subModules: {},
          },
        };

        const result = resolveScopesFromConfig(config, mockScopes);

        expect(result).toHaveLength(3);
        expect(result.map((s) => s.name)).toContain('risks:list');
      });

      it('should handle scope with empty module string', () => {
        const scopesWithEmpty: ResourceScope[] = [
          ...mockScopes,
          {
            name: 'empty:test' as ResourceScopeKey,
            desc: 'Empty module',
            module: '',
          },
        ];

        const config: ModuleConfig = {
          risk: { enabled: true },
        };

        const result = resolveScopesFromConfig(config, scopesWithEmpty);

        expect(result.map((s) => s.name)).not.toContain('empty:test');
      });
    });
  });
});
