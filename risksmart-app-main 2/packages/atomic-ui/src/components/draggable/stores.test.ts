import { describe, expect, it } from 'vitest';

import { createDraggableStore, fallbackStore, storeRegistry } from './stores';

describe('fallbackStore', () => {
  it('registerOverlay returns a callable cleanup function', () => {
    const cleanup = fallbackStore.getState().registerOverlay();

    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
  });
});

describe('createDraggableStore', () => {
  it('creates a store with default state', () => {
    const store = createDraggableStore();
    const state = store.getState();

    expect(state.activeId).toBeNull();
    expect(state.overId).toBeNull();
    expect(state.hasOverlay).toBe(false);
  });

  it('setActiveId updates activeId', () => {
    const store = createDraggableStore();

    store.getState().setActiveId('item-1');
    expect(store.getState().activeId).toBe('item-1');

    store.getState().setActiveId(null);
    expect(store.getState().activeId).toBeNull();
  });

  it('setOverId updates overId', () => {
    const store = createDraggableStore();

    store.getState().setOverId('item-2');
    expect(store.getState().overId).toBe('item-2');

    store.getState().setOverId(null);
    expect(store.getState().overId).toBeNull();
  });

  it('registerOverlay sets hasOverlay and cleanup resets it', () => {
    const store = createDraggableStore();

    const cleanup = store.getState().registerOverlay();
    expect(store.getState().hasOverlay).toBe(true);

    cleanup();
    expect(store.getState().hasOverlay).toBe(false);
  });
});

describe('storeRegistry', () => {
  it('stores and retrieves a store by scope ID', () => {
    const store = createDraggableStore();
    storeRegistry.set('test-scope', store);

    expect(storeRegistry.get('test-scope')).toBe(store);

    storeRegistry.delete('test-scope');
    expect(storeRegistry.get('test-scope')).toBeUndefined();
  });
});
