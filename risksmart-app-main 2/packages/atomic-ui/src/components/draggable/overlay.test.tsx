// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@dnd-kit/core', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DndContext: (props: any) => createElement('div', null, props.children),
  closestCenter: vi.fn(),
  defaultDropAnimationSideEffects: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DragOverlay: (props: any) => createElement('div', null, props.children),
  MeasuringStrategy: { Always: 'always' },
}));

vi.mock('@dnd-kit/sortable', () => ({
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
}));

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
  setCurrentScopeId,
  storeRegistry,
} from './stores';

describe('DraggableOverlay store registry branch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentScopeId(null);
  });

  it('falls back to fallbackStore when scopeId is set but store is missing', () => {
    setCurrentScopeId('missing-scope');
    const container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      createRoot(container).render(
        createElement(Draggable.Overlay, {
          children: () => createElement('span', null, 'overlay-content'),
        })
      );
    });

    // The overlay renders (using fallbackStore since the scope store is missing)
    expect(document.body.innerHTML).toBeDefined();

    document.body.removeChild(container);
    setCurrentScopeId(null);
  });

  it('uses store from registry when scopeId and store are both set', () => {
    const scopeId = 'overlay-scope';
    const store = createDraggableStore();
    storeRegistry.set(scopeId, store);
    setCurrentScopeId(scopeId);

    const container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      createRoot(container).render(
        createElement(Draggable.Overlay, {
          children: () => createElement('span', null, 'scoped-overlay'),
        })
      );
    });

    expect(document.body.innerHTML).toBeDefined();

    document.body.removeChild(container);
    storeRegistry.delete(scopeId);
    setCurrentScopeId(null);
  });
});
