import type {
  AutoScrollOptions,
  CollisionDetection,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  MeasuringConfiguration,
  SensorDescriptor,
  SensorOptions,
} from '@dnd-kit/core';
import { DndContext, MeasuringStrategy } from '@dnd-kit/core';
import type { SortingStrategy } from '@dnd-kit/sortable';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ComponentPropsWithoutRef } from 'react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useStore } from 'zustand';

import { cn } from '../../lib/utils';
import { createMultiContainerCollision } from './collision';
import { useDefaultDragSensors, useDragHandle } from './hooks';
import type { UniqueIdentifier } from './stores';
import {
  createDraggableStore,
  currentScopeId,
  fallbackStore,
  handleDataMap,
  setCurrentContainerId,
  setCurrentHandleScope,
  setCurrentScopeId,
  storeRegistry,
} from './stores';

// ---------------------------------------------------------------------------
// Multi-container move event
// ---------------------------------------------------------------------------

export interface DragMoveEvent {
  /** The item being dragged. */
  activeId: UniqueIdentifier;
  /** Container the active item was dragged from. */
  fromContainerId: UniqueIdentifier;
  /** Container the active item is being dragged to. */
  toContainerId: UniqueIdentifier;
  /** Index of the active item within the target container (insertion point). */
  overIndex: number;
}

// ---------------------------------------------------------------------------
// Draggable.Multi (root)
// ---------------------------------------------------------------------------

export interface DraggableMultiProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'onDragEnd' | 'onDragStart' | 'onDragOver'
> {
  /**
   * Map of `containerId → itemIds[]`. The component is **controlled**;
   * consumers manage item placement via `onMove` / `onReorderContainers`.
   */
  containers: Record<string, UniqueIdentifier[]>;
  /** Order of container IDs (for sortable containers). */
  containerOrder: UniqueIdentifier[];
  /** Called when an item is moved between or within containers. */
  onMove: (event: DragMoveEvent) => void;
  /** Called when containers themselves are reordered. */
  onReorderContainers?: (containerOrder: UniqueIdentifier[]) => void;
  /** Called when a drag starts. */
  onDragStart?: (event: DragStartEvent) => void;
  /** Called when the drag ends. */
  onDragEnd?: (event: DragEndEvent) => void;
  /** Called when a drag is cancelled. */
  onDragCancel?: () => void;
  sensors?: SensorDescriptor<SensorOptions>[];
  collisionDetection?: CollisionDetection;
  /** Custom measuring config. Defaults to `MeasuringStrategy.Always` for droppables. */
  measuring?: MeasuringConfiguration;
  /**
   * Auto-scroll configuration passed to `DndContext`. Defaults to
   * `{ layoutShiftCompensation: false }` to prevent infinite update loops
   * when the drag occurs inside a scrollable container (e.g. a dialog).
   */
  autoScroll?: boolean | AutoScrollOptions;
}

const DEFAULT_MEASURING: MeasuringConfiguration = {
  droppable: { strategy: MeasuringStrategy.Always },
};

/**
 * Multi-container drag root: a single `DndContext` that manages
 * cross-container item dragging and optional container reordering.
 *
 * ```tsx
 * <Draggable.Multi
 *   containers={containers}
 *   containerOrder={order}
 *   onMove={handleMove}
 * >
 *   {order.map((id) => (
 *     <Draggable.Container key={id} id={id} items={containers[id]}>
 *       {containers[id].map((itemId) => (
 *         <Draggable.Item key={itemId} id={itemId}>…</Draggable.Item>
 *       ))}
 *     </Draggable.Container>
 *   ))}
 *   <Draggable.Overlay>{(id) => …}</Draggable.Overlay>
 * </Draggable.Multi>
 * ```
 */
const DEFAULT_AUTO_SCROLL = { layoutShiftCompensation: false };

export function DraggableMultiRoot({
  containers,
  containerOrder,
  onMove,
  onReorderContainers,
  onDragStart: onDragStartProp,
  onDragEnd: onDragEndProp,
  onDragCancel: onDragCancelProp,
  sensors: sensorsProp,
  collisionDetection: collisionDetectionProp,
  measuring,
  autoScroll: autoScrollProp,
  className,
  children,
  ...props
}: DraggableMultiProps) {
  const id = useId();
  const [scopeId] = useState(() => `drag-multi-${id}`);
  const [store] = useState(() => createDraggableStore());

  // Register store in registry and set scope (during render, before children)
  storeRegistry.set(scopeId, store);
  setCurrentScopeId(scopeId);

  // Track activeContainerId as a ref (not shared state)
  const activeContainerIdRef = useRef<UniqueIdentifier | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    const rafRef = crossContainerRaf;

    return () => {
      storeRegistry.delete(scopeId);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [scopeId]);

  // Collision detection helpers
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  const autoScroll = autoScrollProp ?? DEFAULT_AUTO_SCROLL;

  const defaultSensors = useDefaultDragSensors();
  const sensors = sensorsProp ?? defaultSensors;

  // Subscribe to activeId so the collision detection memo updates on drag start/end.
  const activeId = useStore(store, (s) => s.activeId);
  const multiCollision = useMemo(
    () =>
      createMultiContainerCollision({
        containers,
        activeId,
        lastOverId,
        recentlyMovedToNewContainer,
      }),
    [containers, activeId]
  );

  const collisionDetection = collisionDetectionProp ?? multiCollision;

  /** Reverse index: itemId → containerId for O(1) lookups in hot paths. */
  const itemToContainerMap = useMemo(() => {
    const map = new Map<UniqueIdentifier, UniqueIdentifier>();
    for (const [containerId, items] of Object.entries(containers)) {
      for (const itemId of items) {
        map.set(itemId, containerId);
      }
    }

    return map;
  }, [containers]);

  /** Find which container an item belongs to. */
  const findContainer = useCallback(
    (itemId: UniqueIdentifier): UniqueIdentifier | undefined => {
      // Is it a container itself?
      if (itemId in containers) {
        return itemId;
      }

      return itemToContainerMap.get(itemId);
    },
    [containers, itemToContainerMap]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      store.getState().setActiveId(active.id);
      activeContainerIdRef.current = findContainer(active.id) ?? null;
      onDragStartProp?.(event);
    },
    [store, findContainer, onDragStartProp]
  );

  const crossContainerRaf = useRef<number | null>(null);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      store.getState().setOverId(over?.id ?? null);

      if (!over || active.id === over.id) {
        return;
      }

      // Container reordering is handled entirely in handleDragEnd – skip
      // cross-container move logic when the dragged item is a container itself.
      if (active.id in containers) {
        return;
      }

      const fromContainerId = findContainer(active.id);
      const toContainerId = findContainer(over.id);

      if (!fromContainerId || !toContainerId) {
        return;
      }

      // Only fire onMove when crossing containers
      if (fromContainerId !== toContainerId) {
        // Guard: after a cross-container move, the collision detection may
        // oscillate (the new layout shifts rects causing collisions to flip
        // back to the original container).  Skip until one paint frame has
        // passed so measurements can stabilise.
        if (recentlyMovedToNewContainer.current) {
          return;
        }

        recentlyMovedToNewContainer.current = true;

        // Allow the next cross-container move after one animation frame.
        if (crossContainerRaf.current != null) {
          cancelAnimationFrame(crossContainerRaf.current);
        }
        crossContainerRaf.current = requestAnimationFrame(() => {
          recentlyMovedToNewContainer.current = false;
          crossContainerRaf.current = null;
        });

        const overItems = containers[toContainerId];
        const overIndex = overItems.indexOf(over.id);

        onMove({
          activeId: active.id,
          fromContainerId,
          toContainerId,
          overIndex: overIndex >= 0 ? overIndex : overItems.length,
        });

        activeContainerIdRef.current = toContainerId;
      }
    },
    [containers, findContainer, onMove, store]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      store.getState().setActiveId(null);
      store.getState().setOverId(null);
      const activeContainerId = activeContainerIdRef.current;
      activeContainerIdRef.current = null;
      recentlyMovedToNewContainer.current = false;
      if (crossContainerRaf.current != null) {
        cancelAnimationFrame(crossContainerRaf.current);
        crossContainerRaf.current = null;
      }

      if (!over) {
        onDragEndProp?.(event);

        return;
      }

      const fromContainerId = activeContainerId ?? findContainer(active.id);
      const toContainerId = findContainer(over.id);

      if (!fromContainerId || !toContainerId) {
        onDragEndProp?.(event);

        return;
      }

      // Container reorder
      if (
        active.id in containers &&
        over.id in containers &&
        onReorderContainers
      ) {
        const oldIndex = containerOrder.indexOf(active.id);
        const newIndex = containerOrder.indexOf(over.id);
        if (oldIndex !== newIndex) {
          onReorderContainers(arrayMove(containerOrder, oldIndex, newIndex));
        }
      } else if (fromContainerId === toContainerId) {
        // Within-container reorder
        const items = containers[toContainerId];
        const overIndex = items.indexOf(over.id);
        onMove({
          activeId: active.id,
          fromContainerId,
          toContainerId,
          overIndex: overIndex >= 0 ? overIndex : items.length,
        });
      }

      onDragEndProp?.(event);
    },
    [
      store,
      containerOrder,
      containers,
      findContainer,
      onDragEndProp,
      onMove,
      onReorderContainers,
    ]
  );

  const handleDragCancel = useCallback(() => {
    store.getState().setActiveId(null);
    store.getState().setOverId(null);
    activeContainerIdRef.current = null;
    recentlyMovedToNewContainer.current = false;
    if (crossContainerRaf.current != null) {
      cancelAnimationFrame(crossContainerRaf.current);
      crossContainerRaf.current = null;
    }
    onDragCancelProp?.();
  }, [store, onDragCancelProp]);

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={collisionDetection}
      measuring={measuring ?? DEFAULT_MEASURING}
      autoScroll={autoScroll}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={containerOrder}
        strategy={verticalListSortingStrategy}
      >
        <div data-slot={'draggable-multi'} className={cn(className)} {...props}>
          {children}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// ---------------------------------------------------------------------------
// Draggable.Container
// ---------------------------------------------------------------------------

export interface DraggableContainerProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'id'
> {
  /** Unique container identifier. */
  id: UniqueIdentifier;
  /** Ordered item IDs within this container. */
  items: UniqueIdentifier[];
  /** Sorting strategy for items inside this container. */
  strategy?: SortingStrategy;
  /**
   * When `true` the container itself is a sortable element (can be reordered
   * among sibling containers). Uses `useSortable` internally.
   */
  isSortable?: boolean;
}

/**
 * A container for `Draggable.Item` elements within a `Draggable.Multi` root.
 * Wraps a `SortableContext` and provides container identity so items can
 * report their container membership.
 */
export function DraggableContainer({
  id,
  items,
  strategy = verticalListSortingStrategy,
  isSortable = false,
  className,
  children,
  ...props
}: DraggableContainerProps) {
  // Set container ID scope for child items
  setCurrentContainerId(id);

  if (isSortable) {
    return (
      <SortableContainerInner
        id={id}
        items={items}
        strategy={strategy}
        className={className}
        {...props}
      >
        {children}
      </SortableContainerInner>
    );
  }

  return (
    <SortableContext items={items} strategy={strategy}>
      <div
        data-slot={'draggable-container'}
        data-container-id={String(id)}
        className={cn(className)}
        {...props}
      >
        {children}
      </div>
    </SortableContext>
  );
}

// ---------------------------------------------------------------------------
// Internal: Sortable container wrapper (uses useSortable)
// ---------------------------------------------------------------------------

interface SortableContainerInnerProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'id'
> {
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  strategy: SortingStrategy;
}

function SortableContainerInner({
  id,
  items,
  strategy,
  className,
  children,
  ...props
}: SortableContainerInnerProps) {
  const [store] = useState(
    () => (currentScopeId && storeRegistry.get(currentScopeId)) || fallbackStore
  );
  const { handleRegistered, registerHandle } = useDragHandle();

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Set handle scope for any DragHandle children
  setCurrentHandleScope({ type: 'container', id });

  // Register handle data so DragHandle can find it
  handleDataMap.set(String(id), {
    listeners,
    setActivatorNodeRef,
    registerHandle,
  });

  const hasOverlay = useStore(store, (s) => s.hasOverlay);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <SortableContext items={items} strategy={strategy}>
      <div
        ref={setNodeRef}
        data-slot={'draggable-container'}
        data-container-id={String(id)}
        {...(isDragging ? { 'data-dragging': '' } : {})}
        style={style}
        className={cn(
          'relative',
          isDragging && hasOverlay && 'opacity-50',
          className
        )}
        {...(handleRegistered ? {} : { ...attributes, ...listeners })}
        {...props}
      >
        {children}
      </div>
    </SortableContext>
  );
}
