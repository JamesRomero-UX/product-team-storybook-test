import type { StoreApi } from 'zustand';
import { createStore } from 'zustand/vanilla';

// ---------------------------------------------------------------------------
// Public types (re-exported for backward compat with contexts.ts consumers)
// ---------------------------------------------------------------------------

// Must match @dnd-kit/core's SyntheticListenerMap which uses Function.
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type SyntheticListenerMap = Record<string, Function>;

export type UniqueIdentifier = string | number;

export interface DraggableContextValue {
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
  hasOverlay: boolean;
  registerOverlay: () => () => void;
}

export interface HandleContextValue {
  handleRegistered: boolean;
  registerHandle: () => void;
  listeners: SyntheticListenerMap | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
}

// ---------------------------------------------------------------------------
// Zustand store
// ---------------------------------------------------------------------------

interface DraggableStoreState {
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
  hasOverlay: boolean;
}

interface DraggableStoreActions {
  setActiveId: (id: UniqueIdentifier | null) => void;
  setOverId: (id: UniqueIdentifier | null) => void;
  registerOverlay: () => () => void;
}

export type DraggableStore = DraggableStoreState & DraggableStoreActions;

export function createDraggableStore(): StoreApi<DraggableStore> {
  return createStore<DraggableStore>((set) => ({
    activeId: null,
    overId: null,
    hasOverlay: false,
    setActiveId: (id) => set({ activeId: id }),
    setOverId: (id) => set({ overId: id }),
    registerOverlay: () => {
      set({ hasOverlay: true });

      return () => set({ hasOverlay: false });
    },
  }));
}

// ---------------------------------------------------------------------------
// Store registry: root scope ID -> store
// ---------------------------------------------------------------------------

export const storeRegistry = new Map<string, StoreApi<DraggableStore>>();

// ---------------------------------------------------------------------------
// Handle data map: item/container ID -> handle data
// ---------------------------------------------------------------------------

export interface HandleData {
  listeners: SyntheticListenerMap | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  registerHandle: () => void;
}

export const handleDataMap = new Map<string, HandleData>();

// ---------------------------------------------------------------------------
// Module-level scope variables (set by parent, captured by children)
// ---------------------------------------------------------------------------

export let currentScopeId: string | null = null;

export function setCurrentScopeId(id: string | null) {
  currentScopeId = id;
}

export interface HandleScope {
  type: 'item' | 'container';
  id: UniqueIdentifier;
}

export let currentHandleScope: HandleScope | null = null;

export function setCurrentHandleScope(scope: HandleScope | null) {
  currentHandleScope = scope;
}

export let currentContainerId: UniqueIdentifier | null = null;

export function setCurrentContainerId(id: UniqueIdentifier | null) {
  currentContainerId = id;
}

// ---------------------------------------------------------------------------
// Fallback store (for useDraggableContext outside a root)
// ---------------------------------------------------------------------------

export const fallbackStore = createDraggableStore();
