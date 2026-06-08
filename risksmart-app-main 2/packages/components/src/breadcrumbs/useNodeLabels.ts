import { useEffect } from 'react';

import type {
  BreadcrumbNodeLabelConfig,
  BreadcrumbNodeLabelItemConfig,
} from './types';
import { useNodeLabelStore } from './useNodeLabelStore';

/**
 * Hook to fetch and cache a single node label
 * @param nodeType - Type of the node
 * @param nodeId - ID of the node
 * @param getBreadcrumbLabelByNodeType - Function to fetch label by node type and ID
 * @returns Object with label, loading state, and error
 */
export const useNodeLabel = ({
  nodeType,
  nodeId,
  getBreadcrumbLabelByNodeType,
}: BreadcrumbNodeLabelConfig) => {
  const { setLabel, getLabel, markPending } = useNodeLabelStore();
  const { label, loading, error } = getBreadcrumbLabelByNodeType(
    nodeType,
    nodeId
  );

  // Update cache when data arrives
  useEffect(() => {
    if (!nodeId) {
      return;
    }

    if (loading) {
      markPending(nodeType, nodeId);
    } else if (label) {
      setLabel(nodeType, nodeId, label);
    } else if (error) {
      console.error(`Error fetching ${nodeType} label for ${nodeId}:`, error);
      setLabel(nodeType, nodeId, null);
    }
  }, [nodeType, nodeId, label, loading, error, markPending, setLabel]);

  return {
    label: nodeId ? getLabel(nodeType, nodeId) : null,
    loading,
    error,
  };
};

/**
 * Hook to fetch labels for multiple nodes
 * Triggers individual useNodeLabel hooks for each node
 */
export const useNodeLabels = (nodes: BreadcrumbNodeLabelItemConfig[]) => {
  const { getLabel } = useNodeLabelStore();

  const allLoaded = nodes.every(
    ({ nodeType, nodeId }) => getLabel(nodeType, nodeId) !== undefined
  );

  return {
    allLoaded,
    labels: nodes.map(({ nodeType, nodeId }) => ({
      nodeType,
      nodeId,
      label: getLabel(nodeType, nodeId),
    })),
  };
};
