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

const subResourceListSearches = [
  {
    key: 'list_risk_indicators',
    parentEntity: 'risks',
    subResource: 'indicators',
  },
  {
    key: 'list_risk_appetites',
    parentEntity: 'risks',
    subResource: 'appetites',
  },
  {
    key: 'list_risk_impacts',
    parentEntity: 'risks',
    subResource: 'impacts',
  },
  {
    key: 'list_risk_acceptances',
    parentEntity: 'risks',
    subResource: 'acceptances',
  },
  {
    key: 'list_risk_approvals',
    parentEntity: 'risks',
    subResource: 'approvals',
  },
  {
    key: 'list_risk_linked_items',
    parentEntity: 'risks',
    subResource: 'linked-items',
  },
  {
    key: 'list_action_linked_items',
    parentEntity: 'actions',
    subResource: 'linked-items',
  },
  {
    key: 'list_control_linked_items',
    parentEntity: 'controls',
    subResource: 'linked-items',
  },
  {
    key: 'list_indicator_linked_items',
    parentEntity: 'indicators',
    subResource: 'linked-items',
  },
  {
    key: 'list_indicator_results',
    parentEntity: 'indicators',
    subResource: 'results',
  },
  {
    key: 'list_issue_updates',
    parentEntity: 'issues',
    subResource: 'updates',
  },
  {
    key: 'list_issue_actions',
    parentEntity: 'issues',
    subResource: 'actions',
  },
  {
    key: 'list_issue_linked_items',
    parentEntity: 'issues',
    subResource: 'linked-items',
  },
  {
    key: 'list_policy_linked_items',
    parentEntity: 'policies',
    subResource: 'linked-items',
  },
  {
    key: 'list_third_party_linked_items',
    parentEntity: 'third-parties',
    subResource: 'linked-items',
  },
  {
    key: 'list_obligation_linked_items',
    parentEntity: 'compliance/obligations',
    subResource: 'linked-items',
  },
  {
    key: 'list_enterprise_risk_risks',
    parentEntity: 'enterprise-risks',
    subResource: 'risks',
  },
] as const;

describe.each(subResourceListSearches)(
  '$key',
  ({ key, parentEntity, subResource }) => {
    let z: ReturnType<typeof createMockZ>;

    beforeEach(() => {
      z = createMockZ();
    });

    const getPerform = () => {
      const search = App.searches[key];
      if (!search) throw new Error(`Search ${key} not found in App.searches`);
      return search.operation.perform;
    };

    it(`requests GET /${parentEntity}/{id}/${subResource} with default pagination`, async () => {
      z.request.mockResolvedValue(
        mockResponse(200, makeListResponse([]))
      );
      const parentId = 'test-parent-id';
      const bundle = createBundle({ parent_id: parentId });
      await getPerform()(z, bundle);
      expect(z.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `${TEST_BASE_URL}/api/v1/${parentEntity}/${parentId}/${subResource}`,
          params: expect.objectContaining({ page_size: '20' }),
        })
      );
    });

    it('returns results and paging_token when hasMore', async () => {
      const items = [{ id: '1' }, { id: '2' }];
      z.request.mockResolvedValue(
        mockResponse(200, makeListResponse(items, true, 'next-cursor'))
      );
      const bundle = createBundle({ parent_id: 'test-parent-id' });
      const result = (await getPerform()(z, bundle)) as {
        results: unknown[];
        paging_token: string | null;
      };
      expect(result.results).toHaveLength(2);
      expect(result.results[0]).toEqual(expect.objectContaining({ id: '1' }));
      expect(result.results[1]).toEqual(expect.objectContaining({ id: '2' }));
      expect(result.results[0]).toHaveProperty('_zapierLabel');
      expect(result.paging_token).toBe('next-cursor');
    });

    it('returns null paging_token when no more pages', async () => {
      z.request.mockResolvedValue(
        mockResponse(200, makeListResponse([{ id: '1' }], false))
      );
      const bundle = createBundle({ parent_id: 'test-parent-id' });
      const result = (await getPerform()(z, bundle)) as {
        results: unknown[];
        paging_token: string | null;
      };
      expect(result.paging_token).toBeNull();
    });
  }
);

describe('linked-items _zapierLabel', () => {
  it('uses linkedItemTitle and linkedItemType', async () => {
    const z = createMockZ();
    const items = [
      {
        id: 'link-1',
        linkedItemTitle: 'Access Control Policy',
        linkedItemType: 'policy',
      },
    ];
    z.request.mockResolvedValue(
      mockResponse(200, makeListResponse(items, false))
    );
    const bundle = createBundle({ parent_id: 'test-parent-id' });
    const search = App.searches['list_risk_linked_items'];
    const result = (await search!.operation.perform(z, bundle)) as {
      results: Record<string, unknown>[];
    };
    expect(result.results[0]._zapierLabel).toBe(
      'Access Control Policy (policy)'
    );
  });
});

describe('indicator results _zapierLabel', () => {
  it('uses description and resultDate', async () => {
    const z = createMockZ();
    const items = [
      {
        id: 'res-1',
        description: 'Monthly check',
        resultDate: '2026-01-15T10:30:00Z',
      },
    ];
    z.request.mockResolvedValue(
      mockResponse(200, makeListResponse(items, false))
    );
    const bundle = createBundle({ parent_id: 'test-parent-id' });
    const search = App.searches['list_indicator_results'];
    const result = (await search!.operation.perform(z, bundle)) as {
      results: Record<string, unknown>[];
    };
    expect(result.results[0]._zapierLabel).toBe(
      'Monthly check (2026-01-15T10:30:00Z)'
    );
  });
});

describe('get_issue_assessment', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  const getPerform = () => {
    const search = App.searches['get_issue_assessment'];
    if (!search)
      throw new Error('Search get_issue_assessment not found in App.searches');
    return search.operation.perform;
  };

  it('requests GET /issues/{id}/assessment', async () => {
    const assessment = { id: 'asmt-1', parentIssueId: 'issue-1' };
    z.request.mockResolvedValue(mockResponse(200, assessment));
    const bundle = createBundle({ parent_id: 'issue-1' });
    await getPerform()(z, bundle);
    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${TEST_BASE_URL}/api/v1/issues/issue-1/assessment`,
        skipThrowForStatus: true,
      })
    );
  });

  it('returns [assessment] on 200', async () => {
    const assessment = { id: 'asmt-1', parentIssueId: 'issue-1' };
    z.request.mockResolvedValue(mockResponse(200, assessment));
    const bundle = createBundle({ parent_id: 'issue-1' });
    const result = await getPerform()(z, bundle);
    expect(result).toEqual([assessment]);
  });

  it('returns [] on 404', async () => {
    z.request.mockResolvedValue(mockResponse(404, { message: 'Not found' }));
    const bundle = createBundle({ parent_id: 'nonexistent' });
    const result = await getPerform()(z, bundle);
    expect(result).toEqual([]);
  });

  it('throws on non-404 errors', async () => {
    z.request.mockResolvedValue(mockResponse(500, { message: 'Server error' }));
    const bundle = createBundle({ parent_id: 'issue-1' });
    await expect(getPerform()(z, bundle)).rejects.toThrow();
  });
});
