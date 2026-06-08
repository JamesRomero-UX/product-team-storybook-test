import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import type { Location, UIMatch } from 'react-router';
import { useLocation, useMatches } from 'react-router';

import type {
  BreadcrumbItem,
  BreadcrumbNodeLabelItemConfig,
  Match,
} from './types';
import { useNodeLabelStore } from './useNodeLabelStore';

/**
 * Parse route matches to extract nodes that need label fetching
 * @param matches - Array of route matches
 * @returns Array of breadcrumb nodes that need label fetching
 */
const extractNodes = (matches: Match[]): BreadcrumbNodeLabelItemConfig[] => {
  return matches.reduce((acc, match) => {
    const handle = match.handle;

    if (handle?.breadcrumbNode) {
      const nodeId = match.params[handle.breadcrumbNode.paramName];

      if (nodeId) {
        return [
          ...acc,
          {
            nodeType: handle.breadcrumbNode.nodeType,
            nodeId,
          },
        ];
      }
    }

    return acc;
  }, [] as BreadcrumbNodeLabelItemConfig[]);
};

/**
 * Build breadcrumb items from matches, using cached labels where available
 * @param matches - Array of route matches
 * @param location - Current location object
 * @param getLabel - Function to get cached label for a node
 * @returns Array of breadcrumb items with resolved labels
 */
const buildBreadcrumbs = (
  matches: UIMatch[],
  location: Location,
  getLabel: (
    nodeType: Parent_Type_Enum,
    nodeId: string
  ) => string | null | undefined
): BreadcrumbItem[] => {
  const matchesTyped = matches as Match[];

  return matchesTyped.reduce((acc, match) => {
    const { handle } = match as Match;

    if (!handle || (!handle?.title && !handle?.breadcrumbNode)) {
      return acc;
    }

    const href = handle?.breadcrumbUrl
      ? handle.breadcrumbUrl({ match, location })
      : match.pathname;

    const handleBreadcrumbNodeId = handle?.breadcrumbNode
      ? match.params[handle.breadcrumbNode.paramName]
      : null;

    const handleBreadcrumbNodeText =
      handle.breadcrumbNode && handleBreadcrumbNodeId
        ? getLabel(handle.breadcrumbNode.nodeType, handleBreadcrumbNodeId)
        : null;

    const handleTitleText = handle?.title
      ? typeof handle.title === 'function'
        ? handle.title({ match, location })
        : handle.title
      : null;

    const text = handleBreadcrumbNodeText || handleTitleText || null;

    if (text) {
      return [...acc, { text, href }];
    }

    return acc;
  }, [] as BreadcrumbItem[]);
};

/**
 * Hook to get breadcrumbs, fetching dynamic labels as needed and caching them in a Zustand store
 *
 * This hook:
 * 1. Extracts node IDs from route params
 * 2. Returns nodes to be fetched (fetching happens in NodeLabelFetcher component)
 * 3. Builds breadcrumb array with resolved labels from Zustand store
 * 4. Memoizes everything to prevent infinite rerenders
 *
 * @returns Object containing breadcrumbs array, showBreadcrumbs flag, and nodes to fetch
 */
export function useBreadcrumbs() {
  const matches = useMatches();
  const location = useLocation() as Location;
  const { getLabel, pending } = useNodeLabelStore();

  const nodes = useMemo(() => {
    return extractNodes(matches as Match[]);
  }, [matches]);

  const breadcrumbs = useMemo(() => {
    return buildBreadcrumbs(matches, location, getLabel);
    // Including additional 'pending' dep for eager fetching to prevent stale cache issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, location, pending, getLabel]);

  return {
    breadcrumbs,
    showBreadcrumbs: breadcrumbs.length >= 2,
    nodes,
  };
}
