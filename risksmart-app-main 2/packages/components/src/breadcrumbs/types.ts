import type { ApolloError } from '@apollo/client';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { TRPCClientErrorLike } from '@trpc/client';
import type { Location } from 'react-router';

/**
 * Options for Breadcrumb Handle (custom breadcrumb configuration in route)
 */
export interface HandleOptions {
  match: Match;
  location: Location;
}

export interface Match {
  /**
   * Set to true, if this page doesn't follow a hierarchy of objects pattern
   *     list-of-items-page/item-page/list-of-sub-items-page  (don't need isParent=false)
   *     list-of-items-page/add-item-page/item-page/list-of-sub-items-page (add-item-page should have isParent=false)
   */
  isNotParent?: boolean;
  id: string;
  pathname: string;
  params: Record<string, string>;
  data?: unknown;
  loaderData?: unknown;
  handle?: BreadcrumbHandle;
}

export type GetBreadcrumbLabelByNodeType = (
  nodeType: Parent_Type_Enum,
  nodeId: string
) => {
  label: string | null;
  loading: boolean;
  error:
    | TRPCClientErrorLike<{
        transformer: true;
        errorShape: unknown;
      }>
    | ApolloError
    | undefined
    | null;
};

export interface BreadcrumbNodeLabelItemConfig {
  nodeType: Parent_Type_Enum;
  nodeId: string;
}

/**
 * Configuration for fetching node labels
 */
export type BreadcrumbNodeLabelConfig = BreadcrumbNodeLabelItemConfig & {
  getBreadcrumbLabelByNodeType: GetBreadcrumbLabelByNodeType;
};

/**
 * Breadcrumb item with resolved label
 */
export interface BreadcrumbItem {
  text: string;
  href: string;
}

/**
 * Handle configuration for breadcrumbs in route config
 */
export interface BreadcrumbHandle {
  /**
   * Static title for the breadcrumb
   */
  title?: string | ((options: HandleOptions) => string);

  /**
   * Node type and param name for dynamic fetching
   * Example: { nodeType: 'risk', paramName: 'riskId' }
   */
  breadcrumbNode?: {
    nodeType: Parent_Type_Enum;
    paramName: string;
  };

  /**
   * Custom URL for the breadcrumb (optional)
   */
  breadcrumbUrl?: (options: HandleOptions) => string;
}
