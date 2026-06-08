import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  closestCenter: vi.fn(),
  defaultDropAnimationSideEffects: vi.fn(),
  DragOverlay: () => null,
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

vi.mock('./hooks', () => ({
  useDefaultDragSensors: () => [],
  useDragHandle: () => ({
    handleRegistered: false,
    registerHandle: vi.fn(),
  }),
}));

import { Draggable } from './index';
import {
  createDraggableStore,
  setCurrentHandleScope,
  setCurrentScopeId,
  storeRegistry,
} from './stores';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultItems = ['item-1', 'item-2', 'item-3'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderDraggable(overrides: Record<string, any> = {}) {
  const onReorder = vi.fn();
  const props = {
    items: defaultItems,
    onReorder,
    ...overrides,
  };

  renderToString(createElement(Draggable, props));

  return { captured: capturedDndProps, onReorder: props.onReorder };
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
// DraggableRoot
// ---------------------------------------------------------------------------

describe('DraggableRoot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedDndProps = {};
  });

  // -----------------------------------------------------------------------
  // handleDragStart
  // -----------------------------------------------------------------------

  describe('handleDragStart', () => {
    it('calls onDragStart callback when provided', () => {
      const onDragStart = vi.fn();
      const { captured } = renderDraggable({ onDragStart });

      const event = makeDragEvent('item-1', null);
      captured.onDragStart(event);

      expect(onDragStart).toHaveBeenCalledWith(event);
    });

    it('does not throw when onDragStart is not provided', () => {
      const { captured } = renderDraggable();

      expect(() =>
        captured.onDragStart(makeDragEvent('item-1', null))
      ).not.toThrow();
    });
  });

  // -----------------------------------------------------------------------
  // handleDragOver
  // -----------------------------------------------------------------------

  describe('handleDragOver', () => {
    it('calls onDragOver callback when provided', () => {
      const onDragOver = vi.fn();
      const { captured } = renderDraggable({ onDragOver });

      const event = makeDragEvent('item-1', 'item-2');
      captured.onDragOver(event);

      expect(onDragOver).toHaveBeenCalledWith(event);
    });

    it('does not throw when onDragOver is not provided', () => {
      const { captured } = renderDraggable();

      expect(() =>
        captured.onDragOver(makeDragEvent('item-1', 'item-2'))
      ).not.toThrow();
    });

    it('handles over being null', () => {
      const onDragOver = vi.fn();
      const { captured } = renderDraggable({ onDragOver });

      captured.onDragOver(makeDragEvent('item-1', null));

      expect(onDragOver).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // handleDragEnd
  // -----------------------------------------------------------------------

  describe('handleDragEnd', () => {
    it('calls onReorder when items are swapped', () => {
      const { captured, onReorder } = renderDraggable();

      captured.onDragEnd(makeDragEvent('item-1', 'item-2'));

      expect(onReorder).toHaveBeenCalledWith(['item-2', 'item-1', 'item-3']);
    });

    it('does not call onReorder when over is null', () => {
      const { captured, onReorder } = renderDraggable();

      captured.onDragEnd(makeDragEvent('item-1', null));

      expect(onReorder).not.toHaveBeenCalled();
    });

    it('does not call onReorder when active equals over', () => {
      const { captured, onReorder } = renderDraggable();

      captured.onDragEnd(makeDragEvent('item-1', 'item-1'));

      expect(onReorder).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // handleDragCancel
  // -----------------------------------------------------------------------

  describe('handleDragCancel', () => {
    it('calls onDragCancel callback when provided', () => {
      const onDragCancel = vi.fn();
      const { captured } = renderDraggable({ onDragCancel });

      captured.onDragCancel();

      expect(onDragCancel).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onDragCancel is not provided', () => {
      const { captured } = renderDraggable();

      expect(() => captured.onDragCancel()).not.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// DraggableDragHandle (standalone — outside a Draggable.Item)
// ---------------------------------------------------------------------------

describe('DraggableDragHandle', () => {
  beforeEach(() => {
    // Ensure no scope is set so the handle renders the visual fallback
    setCurrentScopeId(null);
    setCurrentHandleScope(null);
  });

  it('renders a visual-only handle when outside a draggable context', () => {
    const html = renderToString(createElement(Draggable.DragHandle));

    expect(html).toContain('data-slot="draggable-drag-handle"');
    // Should NOT contain cursor-grab (interactive class) in the fallback
    expect(html).not.toContain('cursor-grab');
  });

  it('renders custom children in the visual fallback', () => {
    const html = renderToString(
      createElement(Draggable.DragHandle, {
        children: createElement('span', null, 'custom-handle'),
      })
    );

    expect(html).toContain('custom-handle');
    expect(html).toContain('data-slot="draggable-drag-handle"');
  });
});

// ---------------------------------------------------------------------------
// Store registry branch coverage
// ---------------------------------------------------------------------------

describe('DraggableItem with registered scope store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses store from registry when currentScopeId is set', () => {
    const scopeId = 'test-scope';
    const store = createDraggableStore();
    storeRegistry.set(scopeId, store);
    setCurrentScopeId(scopeId);

    const html = renderToString(
      createElement(Draggable.Item, { id: 'item-1' }, 'child')
    );

    expect(html).toContain('data-slot="draggable-item"');

    // Cleanup
    storeRegistry.delete(scopeId);
    setCurrentScopeId(null);
  });

  it('falls back to fallbackStore when scopeId is set but store is not registered', () => {
    setCurrentScopeId('non-existent-scope');

    const html = renderToString(
      createElement(Draggable.Item, { id: 'item-2' }, 'fallback')
    );

    expect(html).toContain('data-slot="draggable-item"');
    expect(html).toContain('fallback');

    setCurrentScopeId(null);
  });
});
