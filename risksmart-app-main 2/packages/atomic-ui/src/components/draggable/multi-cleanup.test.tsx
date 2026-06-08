// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Global stubs
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
// Mocks
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arrayMove: (arr: any[], from: number, to: number) => {
    const result = [...arr];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);

    return result;
  },
}));

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

import { DraggableMultiRoot } from './multi';
import { storeRegistry } from './stores';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DraggableMultiRoot cleanup on unmount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedDndProps = {};
  });

  it('deletes store from registry on unmount', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container);

    act(() => {
      root.render(
        createElement(DraggableMultiRoot, {
          containers: { A: ['item-1'] },
          containerOrder: ['A'],
          onMove: vi.fn(),
        })
      );
    });

    // Store should be registered
    const registrySize = storeRegistry.size;
    expect(registrySize).toBeGreaterThan(0);

    // Unmount to trigger cleanup
    act(() => {
      root.unmount();
    });

    expect(storeRegistry.size).toBe(registrySize - 1);

    document.body.removeChild(container);
  });

  it('cancels pending crossContainerRaf on unmount', () => {
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container);

    act(() => {
      root.render(
        createElement(DraggableMultiRoot, {
          containers: { A: ['item-1', 'item-2'], B: ['item-3'] },
          containerOrder: ['A', 'B'],
          onMove: vi.fn(),
        })
      );
    });

    // Trigger a cross-container dragOver to set crossContainerRaf.current
    act(() => {
      capturedDndProps.onDragOver({
        active: { id: 'item-1', data: { current: {} }, rect: {} },
        over: { id: 'item-3', data: { current: {} }, rect: {} },
        activatorEvent: {},
        collisions: [],
        delta: { x: 0, y: 0 },
      });
    });

    cancelSpy.mockClear();

    // Unmount triggers cleanup which should cancel the raf
    act(() => {
      root.unmount();
    });

    expect(cancelSpy).toHaveBeenCalled();
    cancelSpy.mockRestore();
    document.body.removeChild(container);
  });
});
