import { beforeEach, describe, expect, it } from 'vitest';

import App from '../../src/index.js';
import {
  createBundle,
  createMockZ,
  mockResponse,
  TEST_BASE_URL,
} from '../helpers/bundle.js';

const makeListResponse = (
  data: Record<string, unknown>[],
  hasMore = false,
  afterCursor: string | null = null
) => ({
  data,
  pageInfo: {
    hasMore,
    afterCursor,
    beforeCursor: null,
    nextPage: null,
    prevPage: null,
    count: data.length,
  },
});

const listSearches = [
  { key: 'list_risks', path: '/risks' },
  { key: 'list_indicators', path: '/indicators' },
  { key: 'list_controls', path: '/controls' },
  { key: 'list_actions', path: '/actions' },
  { key: 'list_issues', path: '/issues' },
  { key: 'list_policies', path: '/policies' },
  { key: 'list_assessments', path: '/assessments' },
  { key: 'list_obligations', path: '/compliance/obligations' },
  { key: 'list_third_parties', path: '/third-parties' },
  { key: 'list_enterprise_risks', path: '/enterprise-risks' },
  { key: 'list_impacts', path: '/impacts' },
] as const;

describe.each(listSearches)('$key', ({ key, path }) => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  const getPerform = () => {
    const search = App.searches[key];
    if (!search) throw new Error(`Search ${key} not found in App.searches`);
    return search.operation.perform;
  };

  it(`requests GET ${path} with default pagination`, async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeListResponse([]))
    );
    const bundle = createBundle();
    await getPerform()(z, bundle);
    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${TEST_BASE_URL}/api/v1${path}`,
        params: expect.objectContaining({ page_size: '20' }),
      })
    );
  });

  it('returns results and paging_token when hasMore', async () => {
    const items = [{ id: '1' }, { id: '2' }];
    z.request.mockResolvedValue(
      mockResponse(200, makeListResponse(items, true, 'next-cursor'))
    );
    const bundle = createBundle();
    const result = (await getPerform()(z, bundle)) as {
      results: unknown[];
      paging_token: string | null;
    };
    expect(result.results).toHaveLength(2);
    expect(result.results[0]).toEqual(expect.objectContaining({ id: '1' }));
    expect(result.results[1]).toEqual(expect.objectContaining({ id: '2' }));
    // Each result should have a _zapierLabel for dynamic dropdowns
    expect(result.results[0]).toHaveProperty('_zapierLabel');
    expect(result.paging_token).toBe('next-cursor');
  });

  it('returns null paging_token when no more pages', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeListResponse([{ id: '1' }], false))
    );
    const bundle = createBundle();
    const result = (await getPerform()(z, bundle)) as {
      results: unknown[];
      paging_token: string | null;
    };
    expect(result.paging_token).toBeNull();
  });
});
