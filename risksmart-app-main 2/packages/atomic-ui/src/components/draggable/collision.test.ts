import type * as DndKitCore from '@dnd-kit/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = await importOriginal<typeof DndKitCore>();

  return {
    ...actual,
    pointerWithin: vi.fn(),
    rectIntersection: vi.fn(),
    closestCenter: vi.fn(),
    getFirstCollision: vi.fn(),
  };
});

import type { CollisionDetection } from '@dnd-kit/core';
import {
  closestCenter,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';

import { createMultiContainerCollision } from './collision';

type CollisionArgs = Parameters<CollisionDetection>[0];

const makeArgs = (overrides: Partial<CollisionArgs> = {}) =>
  ({
    active: {
      id: 'item-a',
      data: { current: {} },
      rect: { current: { initial: null, translated: null } },
    },
    collisionRect: {
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    droppableContainers: [],
    droppableRects: new Map(),
    pointerCoordinates: null,
    ...overrides,
  }) as unknown as CollisionArgs;

describe('createMultiContainerCollision', () => {
  let lastOverId: { current: string | number | null };
  let recentlyMovedToNewContainer: { current: boolean };

  beforeEach(() => {
    vi.mocked(pointerWithin).mockReset();
    vi.mocked(rectIntersection).mockReset();
    vi.mocked(closestCenter).mockReset();
    vi.mocked(getFirstCollision).mockReset();

    lastOverId = { current: null };
    recentlyMovedToNewContainer = { current: false };
  });

  it('uses closestCenter among containers when active item is a container', () => {
    const containers: Record<string, string[]> = {
      'container-1': ['item-x'],
      'container-2': ['item-y'],
    };

    const droppableContainers = [
      { id: 'container-1' },
      { id: 'container-2' },
      { id: 'item-x' },
      { id: 'item-y' },
    ];

    vi.mocked(closestCenter).mockReturnValue([{ id: 'container-2' }]);

    const detect = createMultiContainerCollision({
      containers,
      activeId: 'container-1',
      lastOverId,
      recentlyMovedToNewContainer,
    });

    const args = makeArgs({
      droppableContainers: droppableContainers as never,
    });
    const result = detect(args);

    expect(closestCenter).toHaveBeenCalledWith(
      expect.objectContaining({
        droppableContainers: [{ id: 'container-1' }, { id: 'container-2' }],
      })
    );
    expect(result).toEqual([{ id: 'container-2' }]);
  });

  it('returns empty array when no intersections and lastOverId is null', () => {
    const containers: Record<string, string[]> = {
      'container-1': ['item-x'],
    };

    vi.mocked(pointerWithin).mockReturnValue([]);
    vi.mocked(rectIntersection).mockReturnValue([]);
    vi.mocked(getFirstCollision).mockReturnValue(undefined);

    const detect = createMultiContainerCollision({
      containers,
      activeId: 'item-x',
      lastOverId,
      recentlyMovedToNewContainer,
    });

    const result = detect(makeArgs());

    expect(result).toEqual([]);
  });

  it('returns activeId when no intersections and recentlyMovedToNewContainer is true', () => {
    const containers: Record<string, string[]> = {
      'container-1': ['item-a'],
    };

    recentlyMovedToNewContainer.current = true;

    vi.mocked(pointerWithin).mockReturnValue([]);
    vi.mocked(rectIntersection).mockReturnValue([]);
    vi.mocked(getFirstCollision).mockReturnValue(undefined);

    const detect = createMultiContainerCollision({
      containers,
      activeId: 'item-a',
      lastOverId,
      recentlyMovedToNewContainer,
    });

    const result = detect(makeArgs());

    expect(lastOverId.current).toBe('item-a');
    expect(result).toEqual([{ id: 'item-a' }]);
  });

  it('drills down into a container with items via closestCenter', () => {
    const containers: Record<string, string[]> = {
      'container-1': ['item-x', 'item-y'],
    };

    const droppableContainers = [
      { id: 'container-1' },
      { id: 'item-x' },
      { id: 'item-y' },
    ];

    vi.mocked(pointerWithin).mockReturnValue([{ id: 'container-1' }] as never);
    vi.mocked(getFirstCollision).mockReturnValue('container-1');
    vi.mocked(closestCenter).mockReturnValue([{ id: 'item-x' }]);

    const detect = createMultiContainerCollision({
      containers,
      activeId: 'item-a',
      lastOverId,
      recentlyMovedToNewContainer,
    });

    const args = makeArgs({
      droppableContainers: droppableContainers as never,
    });
    const result = detect(args);

    expect(result).toEqual([{ id: 'item-x' }]);
    expect(lastOverId.current).toBe('item-x');
  });

  it('returns the container id when the container has no items', () => {
    const containers: Record<string, string[]> = {
      'container-empty': [],
    };

    vi.mocked(pointerWithin).mockReturnValue([
      { id: 'container-empty' },
    ] as never);
    vi.mocked(getFirstCollision).mockReturnValue('container-empty');

    const detect = createMultiContainerCollision({
      containers,
      activeId: 'item-a',
      lastOverId,
      recentlyMovedToNewContainer,
    });

    const result = detect(makeArgs());

    expect(result).toEqual([{ id: 'container-empty' }]);
    expect(lastOverId.current).toBe('container-empty');
  });

  it('uses cached lastOverId when no new intersections are found', () => {
    const containers: Record<string, string[]> = {
      'container-1': ['item-x', 'item-y'],
    };

    // First call: hit item-x
    vi.mocked(pointerWithin).mockReturnValueOnce([
      { id: 'container-1' },
    ] as never);
    vi.mocked(getFirstCollision).mockReturnValueOnce('container-1');
    vi.mocked(closestCenter).mockReturnValueOnce([{ id: 'item-x' }]);

    const detect = createMultiContainerCollision({
      containers,
      activeId: 'item-a',
      lastOverId,
      recentlyMovedToNewContainer,
    });

    detect(makeArgs());
    expect(lastOverId.current).toBe('item-x');

    // Second call: no intersections
    vi.mocked(pointerWithin).mockReturnValueOnce([]);
    vi.mocked(rectIntersection).mockReturnValueOnce([]);
    vi.mocked(getFirstCollision).mockReturnValueOnce(undefined);

    const result = detect(makeArgs());

    expect(result).toEqual([{ id: 'item-x' }]);
  });

  it('returns the item id when it hits a plain item (not a container)', () => {
    const containers: Record<string, string[]> = {
      'container-1': ['item-a', 'item-b'],
    };

    vi.mocked(pointerWithin).mockReturnValue([{ id: 'item-b' }] as never);
    vi.mocked(getFirstCollision).mockReturnValue('item-b');

    const detect = createMultiContainerCollision({
      containers,
      activeId: 'item-a',
      lastOverId,
      recentlyMovedToNewContainer,
    });

    const result = detect(makeArgs());

    expect(result).toEqual([{ id: 'item-b' }]);
    expect(lastOverId.current).toBe('item-b');
    // closestCenter should NOT have been called for drill-down
    expect(closestCenter).not.toHaveBeenCalled();
  });

  it('falls back to container id when drill-down closestCenter returns empty', () => {
    const containers: Record<string, string[]> = {
      'container-1': ['item-x', 'item-y'],
    };

    const droppableContainers = [
      { id: 'container-1' },
      { id: 'item-x' },
      { id: 'item-y' },
    ];

    vi.mocked(pointerWithin).mockReturnValue([{ id: 'container-1' }] as never);
    vi.mocked(getFirstCollision).mockReturnValue('container-1');
    // drill-down closestCenter returns empty — triggers [0]?.id ?? overId fallback
    vi.mocked(closestCenter).mockReturnValue([]);

    const detect = createMultiContainerCollision({
      containers,
      activeId: 'item-a',
      lastOverId,
      recentlyMovedToNewContainer,
    });

    const args = makeArgs({
      droppableContainers: droppableContainers as never,
    });
    const result = detect(args);

    // Falls back to container id (the overId before drill-down)
    expect(result).toEqual([{ id: 'container-1' }]);
    expect(lastOverId.current).toBe('container-1');
  });
});
