import { describe, expect, it } from 'vitest';

import { applyDragMove } from './constants';

describe('applyDragMove', () => {
  it('reorders within the same container', () => {
    const containers = {
      A: ['x', 'y', 'z'],
      B: ['1', '2'],
    };

    const result = applyDragMove(containers, {
      activeId: 'x',
      fromContainerId: 'A',
      toContainerId: 'A',
      overIndex: 2,
    });

    expect(result.A).toEqual(['y', 'z', 'x']);
    // Other containers are unchanged
    expect(result.B).toEqual(['1', '2']);
  });

  it('moves an item across containers', () => {
    const containers = {
      A: ['x', 'y', 'z'],
      B: ['1', '2'],
    };

    const result = applyDragMove(containers, {
      activeId: 'y',
      fromContainerId: 'A',
      toContainerId: 'B',
      overIndex: 1,
    });

    expect(result.A).toEqual(['x', 'z']);
    expect(result.B).toEqual(['1', 'y', '2']);
  });

  it('moves an item into an empty container at index 0', () => {
    const containers = {
      A: ['x', 'y'],
      B: [],
    };

    const result = applyDragMove(containers, {
      activeId: 'x',
      fromContainerId: 'A',
      toContainerId: 'B',
      overIndex: 0,
    });

    expect(result.A).toEqual(['y']);
    expect(result.B).toEqual(['x']);
  });

  it('leaves source container empty when moving its last item', () => {
    const containers = {
      A: ['x'],
      B: ['1'],
    };

    const result = applyDragMove(containers, {
      activeId: 'x',
      fromContainerId: 'A',
      toContainerId: 'B',
      overIndex: 0,
    });

    expect(result.A).toEqual([]);
    expect(result.B).toEqual(['x', '1']);
  });

  it('appends when overIndex exceeds array length', () => {
    const containers = {
      A: ['x', 'y'],
      B: ['1'],
    };

    const result = applyDragMove(containers, {
      activeId: 'x',
      fromContainerId: 'A',
      toContainerId: 'B',
      overIndex: 99,
    });

    expect(result.A).toEqual(['y']);
    expect(result.B).toEqual(['1', 'x']);
  });

  it('does not mutate the original containers object', () => {
    const containers = {
      A: ['x', 'y', 'z'],
      B: ['1', '2'],
    };

    const originalA = [...containers.A];
    const originalB = [...containers.B];

    applyDragMove(containers, {
      activeId: 'y',
      fromContainerId: 'A',
      toContainerId: 'B',
      overIndex: 1,
    });

    expect(containers.A).toEqual(originalA);
    expect(containers.B).toEqual(originalB);
  });

  it('removes a duplicate from the target before inserting', () => {
    const containers = {
      A: ['x', 'y'],
      B: ['y', '1', '2'],
    };

    const result = applyDragMove(containers, {
      activeId: 'y',
      fromContainerId: 'A',
      toContainerId: 'B',
      overIndex: 2,
    });

    expect(result.A).toEqual(['x']);
    // 'y' was already in B, gets filtered out then spliced at index 2
    expect(result.B).toEqual(['1', '2', 'y']);
  });
});
