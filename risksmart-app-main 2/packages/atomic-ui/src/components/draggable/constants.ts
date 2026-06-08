import { arrayMove } from '@dnd-kit/sortable';

import type { DragMoveEvent } from './multi.tsx';
import type { UniqueIdentifier } from './stores';

export { createMultiContainerCollision } from './collision';
export type { DragMoveEvent } from './multi.tsx';
export { MeasuringStrategy } from '@dnd-kit/core';
export {
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

/**
 * Pure state updater for `Draggable.Multi` `onMove` events.
 *
 * Handles both within-container reordering and cross-container moves so
 * consumers don't have to re-implement the same logic every time:
 *
 * ```ts
 * const handleMove = useCallback(
 *   (event: DragMoveEvent) =>
 *     setContainers((prev) => applyDragMove(prev, event)),
 *   [setContainers]
 * );
 * ```
 */
export function applyDragMove(
  containers: Record<string, UniqueIdentifier[]>,
  event: DragMoveEvent
): Record<string, UniqueIdentifier[]> {
  const from = String(event.fromContainerId);
  const to = String(event.toContainerId);
  const { activeId, overIndex } = event;

  if (from === to) {
    const oldIndex = containers[from].indexOf(activeId);

    return {
      ...containers,
      [from]: arrayMove(containers[from], oldIndex, overIndex),
    };
  }

  const fromItems = containers[from].filter((id) => id !== activeId);
  const toItems = containers[to].filter((id) => id !== activeId);
  toItems.splice(overIndex, 0, activeId);

  return { ...containers, [from]: fromItems, [to]: toItems };
}
