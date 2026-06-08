import { describe, expect, it } from 'vitest';

import App from '../src/index.js';

describe('App definition', () => {
  it('exports a version string', () => {
    expect(typeof App.version).toBe('string');
    expect(App.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('exports a platformVersion string', () => {
    expect(typeof App.platformVersion).toBe('string');
  });

  it('has session authentication configured', () => {
    expect(App.authentication.type).toBe('session');
    expect(App.authentication.sessionConfig).toBeDefined();
    expect(typeof App.authentication.sessionConfig.perform).toBe('function');
    expect(typeof App.authentication.test).toBe('function');
  });

  it('has exactly one beforeRequest middleware', () => {
    expect(App.beforeRequest).toHaveLength(1);
    expect(typeof App.beforeRequest[0]).toBe('function');
  });

  it('has no triggers', () => {
    expect(Object.keys(App.triggers)).toHaveLength(0);
  });

  describe('creates', () => {
    const expectedCreates = [
      'create_risk',
      'update_risk',
      'delete_risk',
      'create_indicator',
      'update_indicator',
      'delete_indicator',
    ];

    it.each(expectedCreates)('registers %s action', (key) => {
      expect(App.creates).toHaveProperty(key);
      const action = App.creates[key]!;
      expect(action.key).toBe(key);
      expect(typeof action.operation.perform).toBe('function');
      expect(action.operation.sample).toBeDefined();
      expect(action.operation.inputFields.length).toBeGreaterThan(0);
    });

    it('has exactly 6 create actions', () => {
      expect(Object.keys(App.creates)).toHaveLength(6);
    });
  });

  describe('searches', () => {
    const expectedFindSearches = [
      'find_risk',
      'find_indicator',
      'find_control',
      'find_action',
      'find_issue',
      'find_policy',
      'find_assessment',
      'find_obligation',
      'find_third_party',
      'find_enterprise_risk',
      'find_impact',
      'find_user',
    ];

    const expectedListSearches = [
      'list_risks',
      'list_indicators',
      'list_controls',
      'list_actions',
      'list_issues',
      'list_policies',
      'list_assessments',
      'list_obligations',
      'list_third_parties',
      'list_enterprise_risks',
      'list_impacts',
    ];

    const expectedSubResourceListSearches = [
      'list_risk_indicators',
      'list_risk_appetites',
      'list_risk_impacts',
      'list_risk_acceptances',
      'list_risk_approvals',
      'list_risk_linked_items',
      'list_action_linked_items',
      'list_control_linked_items',
      'list_indicator_linked_items',
      'list_indicator_results',
      'list_issue_updates',
      'list_issue_actions',
      'list_issue_linked_items',
      'list_policy_linked_items',
      'list_third_party_linked_items',
      'list_obligation_linked_items',
      'list_enterprise_risk_risks',
    ];

    const expectedSingletonSearches = ['get_issue_assessment'];

    const expectedSuperZapSearches = [
      'find_actions_by_owner',
      'find_issues_by_owner',
      'find_risks_by_owner',
      'get_issue_details',
      'get_risk_overview',
    ];

    it.each(expectedFindSearches)('registers %s search', (key) => {
      expect(App.searches).toHaveProperty(key);
      const search = App.searches[key]!;
      expect(search.key).toBe(key);
      expect(typeof search.operation.perform).toBe('function');
      expect(search.operation.sample).toBeDefined();
    });

    it.each(expectedListSearches)('registers %s search', (key) => {
      expect(App.searches).toHaveProperty(key);
      const search = App.searches[key]!;
      expect(search.key).toBe(key);
      expect(typeof search.operation.perform).toBe('function');
      expect(search.operation.canPaginate).toBe(true);
    });

    it.each(expectedSubResourceListSearches)(
      'registers %s sub-resource list search',
      (key) => {
        expect(App.searches).toHaveProperty(key);
        const search = App.searches[key]!;
        expect(search.key).toBe(key);
        expect(typeof search.operation.perform).toBe('function');
        expect(search.operation.canPaginate).toBe(true);
      }
    );

    it.each(expectedSingletonSearches)(
      'registers %s singleton search',
      (key) => {
        expect(App.searches).toHaveProperty(key);
        const search = App.searches[key]!;
        expect(search.key).toBe(key);
        expect(typeof search.operation.perform).toBe('function');
        expect(search.operation.sample).toBeDefined();
      }
    );

    it.each(expectedSuperZapSearches)(
      'registers %s super zap search',
      (key) => {
        expect(App.searches).toHaveProperty(key);
        const search = App.searches[key]!;
        expect(search.key).toBe(key);
        expect(typeof search.operation.perform).toBe('function');
        expect(search.operation.sample).toBeDefined();
      }
    );

    it('has exactly 46 searches (12 find + 11 list + 17 sub-resource list + 1 singleton + 5 super zaps)', () => {
      expect(Object.keys(App.searches)).toHaveLength(46);
    });
  });

  describe('contract compatibility', () => {
    it('all create actions have noun and display properties', () => {
      for (const [key, action] of Object.entries(App.creates)) {
        expect(action.noun, `${key} missing noun`).toBeTruthy();
        expect(action.display.label, `${key} missing display.label`).toBeTruthy();
        expect(
          action.display.description,
          `${key} missing display.description`
        ).toBeTruthy();
      }
    });

    it('all searches have noun and display properties', () => {
      for (const [key, search] of Object.entries(App.searches)) {
        expect(search.noun, `${key} missing noun`).toBeTruthy();
        expect(search.display.label, `${key} missing display.label`).toBeTruthy();
        expect(
          search.display.description,
          `${key} missing display.description`
        ).toBeTruthy();
      }
    });

    it('all find searches have an id input field', () => {
      const findKeys = Object.keys(App.searches).filter(
        (k) => k.startsWith('find_') && !k.includes('_by_owner')
      );
      for (const key of findKeys) {
        const search = App.searches[key]!;
        const idField = search.operation.inputFields.find(
          (f: Record<string, unknown>) => f.key === 'id'
        );
        expect(idField, `${key} missing id input field`).toBeDefined();
        expect(
          (idField as Record<string, unknown>).required,
          `${key} id field should be required`
        ).toBe(true);
      }
    });

    it('all list searches have page_size and cursor input fields', () => {
      const listKeys = Object.keys(App.searches).filter((k) =>
        k.startsWith('list_')
      );
      for (const key of listKeys) {
        const search = App.searches[key]!;
        const fields = search.operation.inputFields.map(
          (f: Record<string, unknown>) => f.key
        );
        expect(fields, `${key} missing page_size field`).toContain(
          'page_size'
        );
        expect(fields, `${key} missing cursor field`).toContain('cursor');
      }
    });

    it('all samples have an id field', () => {
      const allOps = [
        ...Object.values(App.creates),
        ...Object.values(App.searches),
      ];
      for (const op of allOps) {
        expect(
          op.operation.sample,
          `${op.key} missing sample`
        ).toHaveProperty('id');
      }
    });

    it('authentication has required fields', () => {
      const fieldKeys = App.authentication.fields.map(
        (f: Record<string, unknown>) => f.key
      );
      expect(fieldKeys).toContain('client_key');
      expect(fieldKeys).toContain('client_secret');
      expect(fieldKeys).toContain('api_base_url');
    });
  });
});
