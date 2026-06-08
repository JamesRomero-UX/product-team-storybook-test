import type { FC } from 'react';

import type {
  BreadcrumbNodeLabelConfig,
  BreadcrumbNodeLabelItemConfig,
  GetBreadcrumbLabelByNodeType,
} from './types';
import { useNodeLabel } from './useNodeLabels';

const NodeLabelFetcherItem: FC<BreadcrumbNodeLabelConfig> = ({
  nodeType,
  nodeId,
  getBreadcrumbLabelByNodeType,
}) => {
  useNodeLabel({ nodeType, nodeId, getBreadcrumbLabelByNodeType });

  return null;
};

/**
 * Component that triggers fetching for all nodes in the breadcrumb path
 * This is rendered once and manages all the data fetching
 * Separated from display logic to prevent rerenders
 */
export const NodeLabelFetcher = ({
  nodes,
  getBreadcrumbLabelByNodeType,
}: {
  nodes: BreadcrumbNodeLabelItemConfig[];
  getBreadcrumbLabelByNodeType?: GetBreadcrumbLabelByNodeType;
}) => {
  if (!getBreadcrumbLabelByNodeType) {
    return;
  }

  return (
    <div className={'w-0'}>
      {nodes.map(({ nodeType, nodeId }) => (
        <NodeLabelFetcherItem
          key={`${nodeType}:${nodeId}`}
          nodeId={nodeId}
          nodeType={nodeType}
          getBreadcrumbLabelByNodeType={getBreadcrumbLabelByNodeType}
        />
      ))}
    </div>
  );
};
