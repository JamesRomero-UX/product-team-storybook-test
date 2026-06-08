import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { create } from 'zustand';

interface NodeLabelState {
  labels: Map<string, string | null>;
  pending: Set<string>;
}

interface NodeLabelActions {
  setLabel: (
    nodeType: Parent_Type_Enum,
    nodeId: string,
    label: string | null
  ) => void;
  getLabel: (
    nodeType: Parent_Type_Enum,
    nodeId: string
  ) => string | null | undefined;
  markPending: (nodeType: Parent_Type_Enum, nodeId: string) => void;
}

type NodeLabelStore = NodeLabelState & NodeLabelActions;

const getCacheKey = (nodeType: Parent_Type_Enum, nodeId: string): string => {
  return `${nodeType}:${nodeId}`;
};

export const useNodeLabelStore = create<NodeLabelStore>((set, get) => ({
  // State
  labels: new Map(),
  pending: new Set(),

  // Actions
  setLabel: (nodeType, nodeId, label) => {
    const key = getCacheKey(nodeType, nodeId);
    set((state) => {
      const newLabels = new Map(state.labels);
      newLabels.set(key, label);
      const newPending = new Set(state.pending);
      newPending.delete(key);

      return { labels: newLabels, pending: newPending };
    });
  },

  getLabel: (nodeType, nodeId) => {
    const key = getCacheKey(nodeType, nodeId);
    const { labels } = get();

    return labels.has(key) ? labels.get(key)! : undefined;
  },

  markPending: (nodeType, nodeId) => {
    const key = getCacheKey(nodeType, nodeId);
    set((state) => {
      const newPending = new Set(state.pending);
      newPending.add(key);

      return { pending: newPending };
    });
  },
}));
