import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Global stubs — node environment lacks requestAnimationFrame
// ---------------------------------------------------------------------------

beforeEach(() => {
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
    setTimeout(
      cb,
      0
    ) as unknown as number) as typeof globalThis.requestAnimationFrame;
  globalThis.cancelAnimationFrame = ((id: number) =>
    clearTimeout(id)) as typeof globalThis.cancelAnimationFrame;
});

afterEach(() => {
  // @ts-expect-error — cleaning up the stub
  delete globalThis.requestAnimationFrame;
  // @ts-expect-error — cleaning up the stub
  delete globalThis.cancelAnimationFrame;
});

// ---------------------------------------------------------------------------
// Mocks — intercept DndContext to capture the handler props it receives
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let capturedDndProps: Record<string, any> = {};

vi.mock('@dnd-kit/core', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DndContext: (props: any) => {
    capturedDndProps = props;

    return createElement('div', null, props.children);
  },
  MeasuringStrategy: { Always: 'always' },
}));

vi.mock('@dnd-kit/sortable', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arrayMove = (arr: any[], from: number, to: number) => {
    const result = [...arr];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);

    return result;
  };

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SortableContext: (props: any) => createElement('div', null, props.children),
    useSortable: vi.fn(() => ({
      attributes: { role: 'button' },
      listeners: { onPointerDown: vi.fn() },
      setNodeRef: vi.fn(),
      setActivatorNodeRef: vi.fn(),
      transform: null,
      transition: undefined,
      isDragging: false,
    })),
    verticalListSortingStrategy: vi.fn(),
    arrayMove,
  };
});

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Translate: { toString: () => undefined } },
}));

vi.mock('./collision', () => ({
  createMultiContainerCollision: vi.fn(() => vi.fn()),
}));

vi.mock('./hooks', () => ({
  useDefaultDragSensors: () => [],
  useDragHandle: () => ({
    handleRegistered: false,
    registerHandle: vi.fn(),
  }),
}));

import { DraggableContainer, DraggableMultiRoot } from './multi';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultContainers: Record<string, string[]> = {
  A: ['item-1', 'item-2', 'item-3'],
  B: ['item-4', 'item-5'],
};
const defaultOrder = ['A', 'B'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderMulti(overrides: Record<string, any> = {}) {
  const onMove = vi.fn();
  const props = {
    containers: defaultContainers,
    containerOrder: defaultOrder,
    onMove,
    ...overrides,
  };

  renderToString(createElement(DraggableMultiRoot, props));

  return { captured: capturedDndProps, onMove: props.onMove };
}

function makeDragEvent(
  activeId: string | number,
  overId: string | number | null
) {
  return {
    active: { id: activeId, data: { current: {} }, rect: {} },
    over:
      overId != null ? { id: overId, data: { current: {} }, rect: {} } : null,
    activatorEvent: {},
    collisions: [],
    delta: { x: 0, y: 0 },
  };
}

// ---------------------------------------------------------------------------
// DraggableMultiRoot
// ---------------------------------------------------------------------------

describe('DraggableMultiRoot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedDndProps = {};
  });

  // -----------------------------------------------------------------------
  // handleDragEnd
  // -----------------------------------------------------------------------

  describe('handleDragEnd', () => {
    it('returns early and calls onDragEnd when over is null', () => {
      const onDragEnd = vi.fn();
      const { captured, onMove } = renderMulti({ onDragEnd });

      captured.onDragEnd(makeDragEvent('item-1', null));

      expect(onDragEnd).toHaveBeenCalledTimes(1);
      expect(onMove).not.toHaveBeenCalled();
    });

    it('returns early when over is null without onDragEnd callback', () => {
      const { captured, onMove } = renderMulti();

      captured.onDragEnd(makeDragEvent('item-1', null));

      expect(onMove).not.toHaveBeenCalled();
    });

    it('returns early and calls onDragEnd when container lookup fails', () => {
      const onDragEnd = vi.fn();
      const { captured, onMove } = renderMulti({ onDragEnd });

      captured.onDragEnd(makeDragEvent('unknown', 'also-unknown'));

      expect(onDragEnd).toHaveBeenCalledTimes(1);
      expect(onMove).not.toHaveBeenCalled();
    });

    it('returns early when container lookup fails without onDragEnd callback', () => {
      const { captured, onMove } = renderMulti();

      captured.onDragEnd(makeDragEvent('unknown', 'also-unknown'));

      expect(onMove).not.toHaveBeenCalled();
    });

    it('calls onMove for within-container reorder', () => {
      const { captured, onMove } = renderMulti();

      captured.onDragEnd(makeDragEvent('item-1', 'item-2'));

      expect(onMove).toHaveBeenCalledWith({
        activeId: 'item-1',
        fromContainerId: 'A',
        toContainerId: 'A',
        overIndex: 1,
      });
    });

    it('uses items.length as overIndex when over.id is not found in container items', () => {
      const { captured, onMove } = renderMulti();

      // item-1 is in container A; over.id 'A' resolves to container A via
      // findContainer. items.indexOf('A') = -1, so overIndex falls back to
      // items.length.
      captured.onDragEnd(makeDragEvent('item-1', 'A'));

      expect(onMove).toHaveBeenCalledWith({
        activeId: 'item-1',
        fromContainerId: 'A',
        toContainerId: 'A',
        overIndex: 3,
      });
    });

    it('reorders containers when both active and over are containers', () => {
      const onReorderContainers = vi.fn();
      const { captured } = renderMulti({ onReorderContainers });

      captured.onDragEnd(makeDragEvent('A', 'B'));

      expect(onReorderContainers).toHaveBeenCalledWith(['B', 'A']);
    });

    it('skips container reorder when oldIndex equals newIndex', () => {
      const onReorderContainers = vi.fn();
      const { captured } = renderMulti({ onReorderContainers });

      captured.onDragEnd(makeDragEvent('A', 'A'));

      expect(onReorderContainers).not.toHaveBeenCalled();
    });

    it('skips container reorder when onReorderContainers is not provided', () => {
      const { captured, onMove } = renderMulti();

      captured.onDragEnd(makeDragEvent('A', 'B'));

      // Neither container reorder nor within-container reorder fires because
      // containers A and B differ (not same-container) and there is no
      // onReorderContainers callback.
      expect(onMove).not.toHaveBeenCalled();
    });

    it('always calls onDragEnd at the end of a successful within-container drag', () => {
      const onDragEnd = vi.fn();
      const { captured } = renderMulti({ onDragEnd });

      captured.onDragEnd(makeDragEvent('item-1', 'item-2'));

      expect(onDragEnd).toHaveBeenCalledTimes(1);
    });

    it('completes a successful drag without onDragEnd callback', () => {
      const { captured, onMove } = renderMulti();

      captured.onDragEnd(makeDragEvent('item-1', 'item-3'));

      expect(onMove).toHaveBeenCalled();
    });

    it('cancels pending crossContainerRaf when ending a drag', () => {
      const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');
      const { captured } = renderMulti();

      // Cross-container dragOver sets crossContainerRaf.current
      captured.onDragOver(makeDragEvent('item-1', 'item-4'));
      cancelSpy.mockClear();

      // dragEnd should cancel the pending raf
      captured.onDragEnd(makeDragEvent('item-1', 'item-4'));

      expect(cancelSpy).toHaveBeenCalled();
      cancelSpy.mockRestore();
    });
  });

  // -----------------------------------------------------------------------
  // handleDragOver
  // -----------------------------------------------------------------------

  describe('handleDragOver', () => {
    it('returns early when over is null', () => {
      const { captured, onMove } = renderMulti();

      captured.onDragOver(makeDragEvent('item-1', null));

      expect(onMove).not.toHaveBeenCalled();
    });

    it('returns early when active.id equals over.id', () => {
      const { captured, onMove } = renderMulti();

      captured.onDragOver(makeDragEvent('item-1', 'item-1'));

      expect(onMove).not.toHaveBeenCalled();
    });

    it('returns early when active item is a container', () => {
      const { captured, onMove } = renderMulti();

      captured.onDragOver(makeDragEvent('A', 'item-1'));

      expect(onMove).not.toHaveBeenCalled();
    });

    it('returns early when source container is not found', () => {
      const { captured, onMove } = renderMulti();

      captured.onDragOver(makeDragEvent('unknown', 'item-1'));

      expect(onMove).not.toHaveBeenCalled();
    });

    it('returns early when target container is not found', () => {
      const { captured, onMove } = renderMulti();

      captured.onDragOver(makeDragEvent('item-1', 'unknown'));

      expect(onMove).not.toHaveBeenCalled();
    });

    it('does not fire onMove for same-container moves', () => {
      const { captured, onMove } = renderMulti();

      captured.onDragOver(makeDragEvent('item-1', 'item-2'));

      expect(onMove).not.toHaveBeenCalled();
    });

    it('fires onMove for cross-container moves', () => {
      const { captured, onMove } = renderMulti();

      captured.onDragOver(makeDragEvent('item-1', 'item-4'));

      expect(onMove).toHaveBeenCalledWith({
        activeId: 'item-1',
        fromContainerId: 'A',
        toContainerId: 'B',
        overIndex: 0,
      });
    });

    it('uses overItems.length when over.id is not found in target container items', () => {
      const { captured, onMove } = renderMulti();

      // item-1 is in container A; 'B' resolves to container B.
      // overItems = containers['B'], overItems.indexOf('B') = -1 → fallback.
      captured.onDragOver(makeDragEvent('item-1', 'B'));

      expect(onMove).toHaveBeenCalledWith({
        activeId: 'item-1',
        fromContainerId: 'A',
        toContainerId: 'B',
        overIndex: 2,
      });
    });

    it('skips cross-container move when recentlyMovedToNewContainer is true', () => {
      const { captured, onMove } = renderMulti();

      // First cross-container move sets recentlyMovedToNewContainer = true
      captured.onDragOver(makeDragEvent('item-1', 'item-4'));
      expect(onMove).toHaveBeenCalledTimes(1);

      // Second rapid cross-container move is suppressed by the guard
      captured.onDragOver(makeDragEvent('item-1', 'item-5'));
      expect(onMove).toHaveBeenCalledTimes(1);
    });
  });

  // -----------------------------------------------------------------------
  // handleDragStart
  // -----------------------------------------------------------------------

  describe('handleDragStart', () => {
    it('calls onDragStart callback when provided', () => {
      const onDragStart = vi.fn();
      const { captured } = renderMulti({ onDragStart });

      const event = { active: { id: 'item-1' } };
      captured.onDragStart(event);

      expect(onDragStart).toHaveBeenCalledWith(event);
    });

    it('does not throw when onDragStart is not provided', () => {
      const { captured } = renderMulti();

      expect(() =>
        captured.onDragStart({ active: { id: 'item-1' } })
      ).not.toThrow();
    });

    it('sets activeContainerId to null when active item has no container', () => {
      const onDragStart = vi.fn();
      const { captured } = renderMulti({ onDragStart });

      // 'ghost' is not in any container — findContainer returns undefined,
      // so the `?? null` fallback at line 172 is exercised.
      captured.onDragStart({ active: { id: 'ghost' } });

      expect(onDragStart).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // handleDragCancel
  // -----------------------------------------------------------------------

  describe('handleDragCancel', () => {
    it('calls onDragCancel callback when provided', () => {
      const onDragCancel = vi.fn();
      const { captured } = renderMulti({ onDragCancel });

      captured.onDragCancel();

      expect(onDragCancel).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onDragCancel is not provided', () => {
      const { captured } = renderMulti();

      expect(() => captured.onDragCancel()).not.toThrow();
    });

    it('cancels pending crossContainerRaf when cancelling a drag', () => {
      const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');
      const { captured } = renderMulti();

      // Cross-container dragOver sets crossContainerRaf.current
      captured.onDragOver(makeDragEvent('item-1', 'item-4'));
      cancelSpy.mockClear();

      // dragCancel should cancel the pending raf
      captured.onDragCancel();

      expect(cancelSpy).toHaveBeenCalled();
      cancelSpy.mockRestore();
    });
  });

  // -----------------------------------------------------------------------
  // Props passthrough
  // -----------------------------------------------------------------------

  describe('props', () => {
    it('uses custom sensors when provided', () => {
      const customSensors = [{ sensor: 'custom' }];
      const { captured } = renderMulti({ sensors: customSensors });

      expect(captured.sensors).toBe(customSensors);
    });

    it('uses default sensors when not provided', () => {
      const { captured } = renderMulti();

      // useDefaultDragSensors mock returns []
      expect(captured.sensors).toEqual([]);
    });

    it('uses custom collisionDetection when provided', () => {
      const customCollision = vi.fn();
      const { captured } = renderMulti({ collisionDetection: customCollision });

      expect(captured.collisionDetection).toBe(customCollision);
    });

    it('uses custom measuring when provided', () => {
      const customMeasuring = { droppable: { strategy: 'custom' } };
      const { captured } = renderMulti({ measuring: customMeasuring });

      expect(captured.measuring).toBe(customMeasuring);
    });

    it('uses default measuring when not provided', () => {
      const { captured } = renderMulti();

      expect(captured.measuring).toEqual({
        droppable: { strategy: 'always' },
      });
    });

    it('uses custom autoScroll when provided', () => {
      const customAutoScroll = { enabled: false };
      const { captured } = renderMulti({ autoScroll: customAutoScroll });

      expect(captured.autoScroll).toBe(customAutoScroll);
    });

    it('uses default autoScroll when not provided', () => {
      const { captured } = renderMulti();

      expect(captured.autoScroll).toEqual({ layoutShiftCompensation: false });
    });
  });
});

// ---------------------------------------------------------------------------
// DraggableContainer
// ---------------------------------------------------------------------------

describe('DraggableContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a non-sortable container with correct data attributes', () => {
    const html = renderToString(
      createElement(DraggableContainer, {
        id: 'C1',
        items: ['x', 'y'],
        children: createElement('span', null, 'hello'),
      })
    );

    expect(html).toContain('data-slot="draggable-container"');
    expect(html).toContain('data-container-id="C1"');
    expect(html).toContain('hello');
  });

  it('renders a sortable container with correct data attributes', () => {
    const html = renderToString(
      createElement(DraggableContainer, {
        id: 'C1',
        items: ['x', 'y'],
        isSortable: true,
        children: createElement('span', null, 'world'),
      })
    );

    expect(html).toContain('data-slot="draggable-container"');
    expect(html).toContain('data-container-id="C1"');
    expect(html).toContain('world');
  });
});
