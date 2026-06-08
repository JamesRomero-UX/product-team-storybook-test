import { randomUUID } from 'node:crypto';

import { beforeAll, describe, expect, it } from 'vitest';

import findRiskSearch from '../../src/searches/find_risk.js';
import App from '../../src/index.js';
import { appTester, authBundle, initSession } from './helpers.js';

const listSearchKeys = [
  'list_risks',
  'list_controls',
  'list_issues',
  'list_policies',
] as const;

describe('Read-only searches (integration)', () => {
  beforeAll(async () => {
    await initSession();
  });
  it.each(listSearchKeys)(
    '%s returns valid pagination structure',
    async (searchKey) => {
      const search = App.searches[searchKey];
      expect(search).toBeDefined();

      const result = await appTester(
        search.operation.perform,
        authBundle({ page_size: 5 })
      );

      expect(result).toHaveProperty('results');
      expect(Array.isArray(result.results)).toBe(true);
      // paging_token is either a string or null
      expect(
        result.paging_token === null ||
          typeof result.paging_token === 'string'
      ).toBe(true);
    }
  );

  it('find with nonexistent ID returns empty array', async () => {
    const fakeId = randomUUID();
    const results = await appTester(
      findRiskSearch.operation.perform,
      authBundle({ id: fakeId })
    );

    expect(results).toEqual([]);
  });
});
