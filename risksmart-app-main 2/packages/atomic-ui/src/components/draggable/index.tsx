import type {
  CollisionDetection,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  SensorDescriptor,
  SensorOptions,
} from '@dnd-kit/core';
import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
} from '@dnd-kit/core';
import type { SortingStrategy } from '@dnd-kit/sortable';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useStore } from 'zustand';

import { cn } from '../../lib/utils';
import { Icon } from '../icon';
import { useDefaultDragSensors, useDragHandle } from './hooks';
import { DraggableContainer, DraggableMultiRoot } from './multi';
import type { HandleScope, UniqueIdentifier } from './stores';
import {
  createDraggableStore,
  currentContainerId,
  currentHandleScope,
  currentScopeId,
  fallbackStore,
  handleDataMap,
  setCurrentHandleScope,
  setCurrentScopeId,
  storeRegistry,
} from './stores';
import { draggableItemVariants } from './variants';

export type { DragEndEvent, DragOverEvent, DragStartEvent };

// ---------------------------------------------------------------------------
// Draggable (root)
// ---------------------------------------------------------------------------

export interface DraggableProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'onDragEnd' | 'onDragStart' | 'onDragOver'
> {
  items: UniqueIdentifier[];
  onReorder: (items: UniqueIdentifier[]) => void;
  sensors?: SensorDescriptor<SensorOptions>[];
  collisionDetection?: CollisionDetection;
  strategy?: SortingStrategy;
  /** Called when a drag starts. Fires after internal state is updated. */
  onDragStart?: (event: DragStartEvent) => void;
  /** Called when the dragged item moves over a new target. */
  onDragOver?: (event: DragOverEvent) => void;
  /** Called when a drag is cancelled (e.g. Escape key). */
  onDragCancel?: () => void;
}

function DraggableRoot({
  items,
  onReorder,
  sensors: sensorsProp,
  collisionDetection = closestCenter,
  strategy = verticalListSortingStrategy,
  onDragStart: onDragStartProp,
  onDragOver: onDragOverProp,
  onDragCancel: onDragCancelProp,
  className,
  children,
  ...props
}: DraggableProps) {
  const id = useId();
  const [scopeId] = useState(() => `drag-root-${id}`);
  const [store] = useState(() => createDraggableStore());

  // Register store in registry and set scope (during render, before children)
  storeRegistry.set(scopeId, store);
  setCurrentScopeId(scopeId);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      storeRegistry.delete(scopeId);
    };
  }, [scopeId]);

  const defaultSensors = useDefaultDragSensors();
  const sensors = sensorsProp ?? defaultSensors;

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      store.getState().setActiveId(event.active.id);
      onDragStartProp?.(event);
    },
    [store, onDragStartProp]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      store.getState().setOverId(event.over?.id ?? null);
      onDragOverProp?.(event);
    },
    [store, onDragOverProp]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      store.getState().setActiveId(null);
      store.getState().setOverId(null);

      if (over && active.id !== over.id) {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        onReorder(arrayMove(items, oldIndex, newIndex));
      }
    },
    [store, items, onReorder]
  );

  const handleDragCancel = useCallback(() => {
    store.getState().setActiveId(null);
    store.getState().setOverId(null);
    onDragCancelProp?.();
  }, [store, onDragCancelProp]);

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={items} strategy={strategy}>
        <div data-slot={'draggable'} className={cn(className)} {...props}>
          {children}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// ---------------------------------------------------------------------------
// Draggable.Item
// ---------------------------------------------------------------------------

interface DraggableItemProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'id'
> {
  id: UniqueIdentifier;
  disabled?: boolean;
}

function DraggableItem({
  id,
  disabled = false,
  className,
  children,
  ...props
}: DraggableItemProps) {
  const [store] = useState(
    () => (currentScopeId && storeRegistry.get(currentScopeId)) || fallbackStore
  );
  const [containerId] = useState(() => currentContainerId);
  const { handleRegistered, registerHandle } = useDragHandle();

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  // Set handle scope for any DragHandle children
  setCurrentHandleScope({ type: 'item', id });

  // Register handle data so DragHandle can find it
  handleDataMap.set(String(id), {
    listeners,
    setActivatorNodeRef,
    registerHandle,
  });

  // Subscribe to store with selectors
  const isSorting = useStore(store, (s) => s.activeId != null);
  const isOver = useStore(store, (s) => s.overId === id && s.activeId !== id);
  const hasOverlay = useStore(store, (s) => s.hasOverlay);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      data-slot={'draggable-item'}
      {...(isDragging ? { 'data-dragging': '' } : {})}
      {...(isOver ? { 'data-over': '' } : {})}
      {...(isSorting ? { 'data-sorting': '' } : {})}
      {...(disabled ? { 'data-disabled': '' } : {})}
      {...(containerId ? { 'data-container': String(containerId) } : {})}
      style={style}
      className={cn(
        draggableItemVariants(),
        isDragging && hasOverlay && 'opacity-50',
        className
      )}
      {...(handleRegistered ? {} : { ...attributes, ...listeners })}
      {...props}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Draggable.DragHandle
// ---------------------------------------------------------------------------

interface DragHandleProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'children' | 'type'
> {
  children?: ReactNode;
}

function DraggableDragHandle({
  className,
  children,
  ...props
}: DragHandleProps) {
  // Capture scope during initial render
  const [scope] = useState<HandleScope | null>(() => currentHandleScope);
  const [store] = useState(() =>
    currentScopeId ? storeRegistry.get(currentScopeId) : undefined
  );

  // Read handle data from the map
  const handleData = scope ? handleDataMap.get(String(scope.id)) : undefined;

  useLayoutEffect(() => {
    handleData?.registerHandle();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Render a purely visual handle when outside any draggable context (e.g. inside an overlay)
  if (!handleData || !store) {
    return (
      <button
        type={'button'}
        data-slot={'draggable-drag-handle'}
        className={cn(
          'flex items-center outline-none bg-transparent p-0',
          className
        )}
        {...props}
      >
        {children ?? <Icon name={'grip-vertical'} size={'sm'} />}
      </button>
    );
  }

  return (
    <button
      type={'button'}
      data-slot={'draggable-drag-handle'}
      ref={handleData.setActivatorNodeRef}
      className={cn(
        'flex items-center hover:cursor-grab active:cursor-grabbing outline-none bg-transparent p-0',
        className
      )}
      {...handleData.listeners}
      {...props}
    >
      {children ?? <Icon name={'grip-vertical'} size={'sm'} />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Draggable.Overlay
// ---------------------------------------------------------------------------

interface DraggableOverlayProps {
  children: (activeId: UniqueIdentifier) => ReactNode;
}

function DraggableOverlay({ children }: DraggableOverlayProps) {
  const [store] = useState(
    () => (currentScopeId && storeRegistry.get(currentScopeId)) || fallbackStore
  );
  const activeId = useStore(store, (s) => s.activeId);
  const prevCursor = useRef('');

  useEffect(() => store.getState().registerOverlay(), [store]);

  useEffect(() => {
    if (activeId == null) {
      return;
    }
    prevCursor.current = document.body.style.cursor;
    document.body.style.cursor = 'grabbing';

    return () => {
      document.body.style.cursor = prevCursor.current;
    };
  }, [activeId]);

  return createPortal(
    <DragOverlay
      adjustScale={false}
      style={{ pointerEvents: 'none' }}
      dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}
    >
      {activeId != null ? (
        <div className={cn('drop-shadow-lg cursor-grabbing')}>
          {children(activeId)}
        </div>
      ) : null}
    </DragOverlay>,
    document.body
  );
}

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const Draggable = Object.assign(DraggableRoot, {
  Item: DraggableItem,
  DragHandle: DraggableDragHandle,
  Overlay: DraggableOverlay,
  /** Multi-container drag root — renders a single DndContext for cross-container dragging. */
  Multi: DraggableMultiRoot,
  /** Container within a `Draggable.Multi` — wraps a SortableContext. */
  Container: DraggableContainer,
});
