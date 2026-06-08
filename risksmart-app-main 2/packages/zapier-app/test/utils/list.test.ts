import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it } from 'vitest';

import { entityPrefixes, performList } from '../../src/utils/list.js';
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

describe('performList', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  it('requests entity URL with default page_size of 20', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeListResponse([]))
    );
    const bundle = createBundle();
    await performList(z, bundle, 'risks');
    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${TEST_BASE_URL}/api/v1/risks`,
        params: { page_size: '20' },
      })
    );
  });

  it('uses custom page_size from inputData', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeListResponse([]))
    );
    const bundle = createBundle({ page_size: 50 });
    await performList(z, bundle, 'risks');
    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ page_size: '50' }),
      })
    );
  });

  it('passes cursor as start_after param', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeListResponse([]))
    );
    const bundle = createBundle({ cursor: 'abc123' });
    await performList(z, bundle, 'risks');
    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ start_after: 'abc123' }),
      })
    );
  });

  it('returns results from data array with display labels', async () => {
    const items = [
      { id: '1', title: 'Risk 1' },
      { id: '2', title: 'Risk 2' },
    ];
    z.request.mockResolvedValue(
      mockResponse(200, makeListResponse(items))
    );
    const bundle = createBundle();
    const result = await performList(z, bundle, 'risks');
    expect(result.results).toEqual([
      { id: '1', title: 'Risk 1', _zapierLabel: 'Risk 1' },
      { id: '2', title: 'Risk 2', _zapierLabel: 'Risk 2' },
    ]);
  });

  it('returns paging_token when hasMore is true', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeListResponse([{ id: '1' }], true, 'cursor-xyz'))
    );
    const bundle = createBundle();
    const result = await performList(z, bundle, 'risks');
    expect(result.paging_token).toBe('cursor-xyz');
  });

  it('returns null paging_token when hasMore is false', async () => {
    z.request.mockResolvedValue(
      mockResponse(
        200,
        makeListResponse([{ id: '1' }], false, 'cursor-xyz')
      )
    );
    const bundle = createBundle();
    const result = await performList(z, bundle, 'risks');
    expect(result.paging_token).toBeNull();
  });

  it('handles missing pageInfo gracefully', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, { data: [{ id: '1' }] })
    );
    const bundle = createBundle();
    const result = await performList(z, bundle, 'risks');
    expect(result.results).toEqual([{ id: '1', _zapierLabel: '' }]);
    expect(result.paging_token).toBeNull();
  });

  it('adds composite _zapierLabel with prefix and sequentialId', async () => {
    const items = [
      { id: '1', title: 'Data Breach Risk', sequentialId: 42 },
    ];
    z.request.mockResolvedValue(
      mockResponse(200, makeListResponse(items))
    );
    const bundle = createBundle();
    const result = await performList(z, bundle, 'risks');
    expect(result.results[0]._zapierLabel).toBe('Data Breach Risk (R-42)');
  });

  it('falls back to title-only label when sequentialId is missing', async () => {
    const items = [{ id: '1', title: 'No Seq ID Risk' }];
    z.request.mockResolvedValue(
      mockResponse(200, makeListResponse(items))
    );
    const bundle = createBundle();
    const result = await performList(z, bundle, 'risks');
    expect(result.results[0]._zapierLabel).toBe('No Seq ID Risk');
  });
});

describe('entityPrefixes sync with web/utils/friendlyId', () => {
  it('matches prefixes defined in packages/web/src/utils/friendlyId.ts', () => {
    // Read the source of truth at test time to catch drift.
    // The web friendlyId.ts is the most complete prefix map.
    const friendlyIdPath = resolve(
      __dirname,
      '../../../web/src/utils/friendlyId.ts'
    );
    const source = readFileSync(friendlyIdPath, 'utf-8');

    // Map from API entity path to the Parent_Type_Enum key used in web
    const entityToParentType: Record<string, string> = {
      risks: 'Risk',
      indicators: 'Indicator',
      controls: 'Control',
      actions: 'Action',
      issues: 'Issue',
      policies: 'Document',
      assessments: 'Assessment',
      'compliance/obligations': 'Obligation',
      'third-parties': 'ThirdParty',
      'enterprise-risks': 'EnterpriseRisk',
      impacts: 'Impact',
    };

    for (const [entity, prefix] of Object.entries(entityPrefixes)) {
      const parentType = entityToParentType[entity];
      // Match patterns like: [Parent_Type_Enum.Risk]: 'R',
      const pattern = new RegExp(
        `\\[Parent_Type_Enum\\.${parentType}\\]:\\s*'(\\w+)'`
      );
      const match = source.match(pattern);
      expect(
        match,
        `Prefix for ${entity} (Parent_Type_Enum.${parentType}) not found in web/utils/friendlyId.ts`
      ).toBeTruthy();
      expect(
        match![1],
        `Prefix mismatch for ${entity}: zapier-app has '${prefix}' but web has '${match?.[1]}'`
      ).toBe(prefix);
    }
  });
});
