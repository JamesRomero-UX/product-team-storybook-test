import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useCallback, useState } from 'react';
import { useStore } from 'zustand';

import type { DraggableContextValue } from './stores';
import { currentScopeId, fallbackStore, storeRegistry } from './stores';

/**
 * Returns `{ activeId, overId }` from the nearest `Draggable` or
 * `Draggable.Multi` ancestor. Useful for child components that need to
 * react to drag state.
 */
export function useDraggableContext(): DraggableContextValue {
  // Capture the store during initial render (parent sets currentScopeId
  // before children render in the same pass).
  const [store] = useState(() => {
    if (currentScopeId) {
      return storeRegistry.get(currentScopeId) ?? fallbackStore;
    }

    return fallbackStore;
  });

  const activeId = useStore(store, (s) => s.activeId);
  const overId = useStore(store, (s) => s.overId);
  const hasOverlay = useStore(store, (s) => s.hasOverlay);
  const registerOverlay = useStore(store, (s) => s.registerOverlay);

  return { activeId, overId, hasOverlay, registerOverlay };
}

/**
 * Default sensor set for all drag roots: pointer (5 px activation), touch,
 * and keyboard with sortable coordinate getter.
 */
export function useDefaultDragSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
}

/**
 * Tracks whether a `DragHandle` has been mounted inside the current
 * sortable item or container. Used to conditionally spread listeners
 * onto the handle element rather than the whole item/container.
 */
export function useDragHandle() {
  const [handleRegistered, setHandleRegistered] = useState(false);

  const registerHandle = useCallback(() => setHandleRegistered(true), []);

  return { handleRegistered, registerHandle };
}
