import type { CollisionDetection } from '@dnd-kit/core';
import {
  closestCenter,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import type { MutableRefObject } from 'react';

type UniqueIdentifier = string | number;

interface MultiContainerCollisionOptions {
  /** Map of containerId → item IDs within that container */
  containers: Record<string, UniqueIdentifier[]>;
  /** Currently active (dragged) item ID */
  activeId: UniqueIdentifier | null;
  /** Ref tracking the last matched overId (managed internally) */
  lastOverId: MutableRefObject<UniqueIdentifier | null>;
  /** Ref indicating a recent cross-container move */
  recentlyMovedToNewContainer: MutableRefObject<boolean>;
}

/**
 * Creates a collision detection strategy optimized for multiple containers.
 *
 * Algorithm:
 * 1. If the active item is a container itself, use closestCenter among containers only.
 * 2. Otherwise, find droppables intersecting with the pointer (or fallback to rect intersection).
 * 3. If we hit a container, drill down to the closest item within it.
 * 4. Cache the last match so layout shifts during cross-container moves don't lose the target.
 *
 * Based on the dnd-kit multi-container example:
 * https://github.com/clauderic/dnd-kit/blob/master/stories/2%20-%20Presets/Sortable/MultipleContainers.tsx
 */
export function createMultiContainerCollision({
  containers,
  activeId,
  lastOverId,
  recentlyMovedToNewContainer,
}: MultiContainerCollisionOptions): CollisionDetection {
  return (args) => {
    // If the active item is itself a container, only consider other containers
    if (activeId && activeId in containers) {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (container) => container.id in containers
        ),
      });
    }

    // Find droppables intersecting with the pointer
    const pointerIntersections = pointerWithin(args);
    const intersections =
      pointerIntersections.length > 0
        ? pointerIntersections
        : rectIntersection(args);

    let overId = getFirstCollision(intersections, 'id');

    if (overId != null) {
      // If we hit a container, drill down to the closest item inside it
      if (overId in containers) {
        const containerItems = containers[overId];

        if (containerItems.length > 0) {
          const itemSet = new Set<UniqueIdentifier>(containerItems);
          overId =
            closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId && itemSet.has(container.id as string)
              ),
            })[0]?.id ?? overId;
        }
      }

      lastOverId.current = overId;

      return [{ id: overId }];
    }

    // When a draggable moves to a new container the layout may shift and
    // overId becomes null. Fall back to the cached value.
    if (recentlyMovedToNewContainer.current) {
      lastOverId.current = activeId;
    }

    return lastOverId.current ? [{ id: lastOverId.current }] : [];
  };
}
