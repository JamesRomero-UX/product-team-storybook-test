import { beforeEach, describe, expect, it } from 'vitest';

import { fetchAllPages, filterByOwner } from '../../src/utils/pagination.js';
import { createBundle, createMockZ, mockResponse } from '../helpers/bundle.js';

describe('fetchAllPages', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  it('returns all items from a single page', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, {
        data: [{ id: '1' }, { id: '2' }],
        pageInfo: { hasMore: false, afterCursor: null },
      })
    );

    const bundle = createBundle();
    const result = await fetchAllPages({ z, bundle, entity: 'risks' });

    expect(result).toEqual({
      items: [{ id: '1' }, { id: '2' }],
      isTruncated: false,
    });
    expect(z.request).toHaveBeenCalledTimes(1);
  });

  it('iterates multiple pages using cursor', async () => {
    z.request
      .mockResolvedValueOnce(
        mockResponse(200, {
          data: [{ id: '1' }],
          pageInfo: { hasMore: true, afterCursor: 'cursor-1' },
        })
      )
      .mockResolvedValueOnce(
        mockResponse(200, {
          data: [{ id: '2' }],
          pageInfo: { hasMore: true, afterCursor: 'cursor-2' },
        })
      )
      .mockResolvedValueOnce(
        mockResponse(200, {
          data: [{ id: '3' }],
          pageInfo: { hasMore: false, afterCursor: null },
        })
      );

    const bundle = createBundle();
    const result = await fetchAllPages({ z, bundle, entity: 'actions' });

    expect(result).toEqual({
      items: [{ id: '1' }, { id: '2' }, { id: '3' }],
      isTruncated: false,
    });
    expect(z.request).toHaveBeenCalledTimes(3);

    // Second call should include start_after cursor
    const secondCallParams = (
      z.request.mock.calls[1] as [{ params: Record<string, string> }]
    )[0].params;
    expect(secondCallParams.start_after).toBe('cursor-1');
  });

  it('caps at MAX_PAGES and logs a warning', async () => {
    // Mock 51 pages — should stop at 50
    for (let i = 0; i < 50; i++) {
      z.request.mockResolvedValueOnce(
        mockResponse(200, {
          data: [{ id: String(i) }],
          pageInfo: { hasMore: true, afterCursor: `cursor-${i}` },
        })
      );
    }

    const bundle = createBundle();
    const result = await fetchAllPages({ z, bundle, entity: 'risks' });

    expect(result.items).toHaveLength(50);
    expect(result.isTruncated).toBe(true);
    expect(z.request).toHaveBeenCalledTimes(50);
    expect(z.console.log).toHaveBeenCalledWith(
      expect.stringContaining('MAX_PAGES')
    );
  });

  it('returns empty array when first page is empty', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, {
        data: [],
        pageInfo: { hasMore: false, afterCursor: null },
      })
    );

    const bundle = createBundle();
    const result = await fetchAllPages({ z, bundle, entity: 'issues' });

    expect(result).toEqual({ items: [], isTruncated: false });
  });

  it('passes extra params to each request', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, {
        data: [{ id: '1' }],
        pageInfo: { hasMore: false, afterCursor: null },
      })
    );

    const bundle = createBundle();
    await fetchAllPages({
      z,
      bundle,
      entity: 'risks',
      params: { status: 'active' },
    });

    const callParams = (
      z.request.mock.calls[0] as [{ params: Record<string, string> }]
    )[0].params;
    expect(callParams.status).toBe('active');
    expect(callParams.page_size).toBe('100');
  });
});

describe('filterByOwner', () => {
  it('returns items where owners includes the given ID', () => {
    const items = [
      { id: '1', owners: ['auth0|abc', 'auth0|def'] },
      { id: '2', owners: ['auth0|ghi'] },
      { id: '3', owners: ['auth0|abc'] },
    ];

    const result = filterByOwner(items, 'auth0|abc');
    expect(result).toEqual([
      { id: '1', owners: ['auth0|abc', 'auth0|def'] },
      { id: '3', owners: ['auth0|abc'] },
    ]);
  });

  it('returns empty array when no items match', () => {
    const items = [
      { id: '1', owners: ['auth0|abc'] },
      { id: '2', owners: ['auth0|def'] },
    ];

    const result = filterByOwner(items, 'auth0|xyz');
    expect(result).toEqual([]);
  });

  it('handles items with empty owners array', () => {
    const items = [
      { id: '1', owners: [] },
      { id: '2', owners: ['auth0|abc'] },
    ];

    const result = filterByOwner(items, 'auth0|abc');
    expect(result).toEqual([{ id: '2', owners: ['auth0|abc'] }]);
  });

  it('handles items with missing owners field', () => {
    const items = [{ id: '1' }, { id: '2', owners: ['auth0|abc'] }];

    const result = filterByOwner(items, 'auth0|abc');
    expect(result).toEqual([{ id: '2', owners: ['auth0|abc'] }]);
  });
});
