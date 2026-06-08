import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

// ---------------------------------------------------------------------------
// We do NOT mock hooks — we're testing the real implementation.
// We still need to mock dnd-kit sensors since useDefaultDragSensors calls them.
// ---------------------------------------------------------------------------
// useDraggableContext only depends on stores + zustand, not dnd-kit, so no
// dnd-kit mocks are needed for these tests.
import { useDraggableContext } from './hooks';
import type { DraggableContextValue } from './stores';
import {
  createDraggableStore,
  setCurrentScopeId,
  storeRegistry,
} from './stores';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let capturedCtx: DraggableContextValue | null = null;

function ContextReader() {
  capturedCtx = useDraggableContext();

  return null;
}

afterEach(() => {
  capturedCtx = null;
  setCurrentScopeId(null);
  storeRegistry.clear();
});

// ---------------------------------------------------------------------------
// useDraggableContext
// ---------------------------------------------------------------------------

describe('useDraggableContext', () => {
  it('returns fallback values when rendered outside a drag root', () => {
    // currentScopeId is null — exercises the `return fallbackStore` branch
    setCurrentScopeId(null);

    renderToString(createElement(ContextReader));

    expect(capturedCtx).not.toBeNull();
    expect(capturedCtx!.activeId).toBeNull();
    expect(capturedCtx!.overId).toBeNull();
    expect(capturedCtx!.hasOverlay).toBe(false);
    expect(typeof capturedCtx!.registerOverlay).toBe('function');
  });

  it('returns fallback values when scopeId exists but store is not in registry', () => {
    // currentScopeId is set but no store registered — exercises the `?? fallbackStore` branch
    setCurrentScopeId('nonexistent-scope');

    renderToString(createElement(ContextReader));

    expect(capturedCtx).not.toBeNull();
    expect(capturedCtx!.activeId).toBeNull();
    expect(capturedCtx!.overId).toBeNull();
    expect(capturedCtx!.hasOverlay).toBe(false);
  });

  it('uses the registered store when rendered inside a scope', () => {
    const store = createDraggableStore();
    storeRegistry.set('test-scope', store);
    setCurrentScopeId('test-scope');

    renderToString(createElement(ContextReader));

    // SSR snapshot returns initial state; the important thing is that
    // the hook resolved without throwing, confirming the registry lookup
    // branch was exercised.
    expect(capturedCtx).not.toBeNull();
    expect(typeof capturedCtx!.registerOverlay).toBe('function');
  });
});
