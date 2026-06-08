import { describe, expect, it, vi } from 'vitest';

import type { ServiceContext } from '../../services/service.types';
import { filterLinkedItems } from '../filtering';

vi.mock('@risksmart-app/permitio/src/permit', () => ({
  filter: vi.fn(),
}));

import { filter } from '@risksmart-app/permitio/src/permit';

const mockFilter = vi.mocked(filter);

const mockCtx: ServiceContext = {
  orgId: 'org-1',
  tenant: 'tenant-1',
  userId: 'user-1',
};

interface LinkedItem {
  Id: string;
  Source: string;
  Target: string;
}

const itemA: LinkedItem = {
  Id: 'link-a',
  Source: 'node-source-1',
  Target: 'node-target-1',
};

const itemB: LinkedItem = {
  Id: 'link-b',
  Source: 'node-source-2',
  Target: 'node-target-2',
};

describe('filterLinkedItems', () => {
  it('returns empty array for empty input', async () => {
    mockFilter.mockResolvedValue([]);
    const result = await filterLinkedItems([], mockCtx);
    expect(result).toEqual([]);
  });

  it('includes item when both source and target are permitted', async () => {
    mockFilter.mockResolvedValue([
      { LinkedItemId: itemA.Id, NodeId: itemA.Source },
      { LinkedItemId: itemA.Id, NodeId: itemA.Target },
    ]);

    const result = await filterLinkedItems([itemA], mockCtx);
    expect(result).toEqual([itemA]);
  });

  it.each([
    [
      'only source is permitted',
      [{ LinkedItemId: itemA.Id, NodeId: itemA.Source }],
    ],
    [
      'only target is permitted',
      [{ LinkedItemId: itemA.Id, NodeId: itemA.Target }],
    ],
  ])('excludes item when %s', async (_label, filteredIds) => {
    mockFilter.mockResolvedValue(filteredIds);

    const result = await filterLinkedItems([itemA], mockCtx);
    expect(result).toEqual([]);
  });

  it('excludes item when neither source nor target is permitted', async () => {
    mockFilter.mockResolvedValue([]);

    const result = await filterLinkedItems([itemA], mockCtx);
    expect(result).toEqual([]);
  });

  it('handles multiple items with mixed permissions', async () => {
    // itemA both permitted, itemB neither permitted
    mockFilter.mockResolvedValue([
      { LinkedItemId: itemA.Id, NodeId: itemA.Source },
      { LinkedItemId: itemA.Id, NodeId: itemA.Target },
    ]);

    const result = await filterLinkedItems([itemA, itemB], mockCtx);
    expect(result).toEqual([itemA]);
  });

  it('passes correct arguments to filter', async () => {
    mockFilter.mockResolvedValue([]);

    await filterLinkedItems([itemA], mockCtx);

    expect(mockFilter).toHaveBeenCalledWith(
      [
        { LinkedItemId: itemA.Id, NodeId: itemA.Source },
        { LinkedItemId: itemA.Id, NodeId: itemA.Target },
      ],
      'rs_node',
      expect.any(Function),
      mockCtx.userId,
      mockCtx.orgId
    );
  });

  it('the NodeId extractor function returns the NodeId', async () => {
    mockFilter.mockResolvedValue([]);

    await filterLinkedItems([itemA], mockCtx);

    const extractorFn = mockFilter.mock.calls[0]![2] as (entity: {
      LinkedItemId: string;
      NodeId: string;
    }) => string;
    expect(extractorFn({ LinkedItemId: 'x', NodeId: 'y' })).toBe('y');
  });
});
