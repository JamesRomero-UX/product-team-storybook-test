import type { LinkedItemsListResponse } from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  LinkedItemListResponse,
  LinkedItemResponse,
} from '../../schemas/schema.types';
import type { ListDataTransformFn } from '../../types/transform';
import type { KnownType } from '../../utils/transforms';
import {
  idToResourceReference,
  nodeObjectTypeToResourceType,
} from '../../utils/transforms';
import { buildBaseLinks } from './base.transformer';

type LinkedItemListItem = LinkedItemsListResponse['linkedItem'][0];
interface TargetDetails {
  title?: string;
  path?: string | null;
}

const mapTargetItem = (
  {
    Target,
    target_node,
    target_acceptance,
    target_risk,
    target_action,
    target_assessment,
    target_control,
    target_indicator,
    target_issue,
    target_obligation,
    target_third_party,
    target_appetite,
  }: LinkedItemListItem,
  basePath: string
) => {
  const { type, path = null } =
    nodeObjectTypeToResourceType(target_node ? target_node.ObjectType : '') ||
    {};
  if (!type) {
    return null;
  }

  const targetMap = new Map<KnownType, TargetDetails>([
    [
      'acceptance',
      {
        title: target_acceptance?.Title,
        path: target_acceptance?.parents[0]?.risk?.Id
          ? `risks/${target_acceptance?.parents[0]?.risk?.Id}/acceptances`
          : null,
      },
    ],
    [
      'appetite',
      {
        title: type,
        path: target_appetite?.parents[0]?.risk?.Id
          ? `risks/${target_appetite?.parents[0]?.risk?.Id}/appetites`
          : null,
      },
    ],
    ['risk', { title: target_risk?.Title }],
    ['action', { title: target_action?.Title }],
    ['assessment', { title: target_assessment?.Title }],
    ['control', { title: target_control?.Title }],
    ['indicator', { title: target_indicator?.Title }],
    ['issue', { title: target_issue?.Title }],
    ['obligation', { title: target_obligation?.Title }],
    ['third_party', { title: target_third_party?.Title }],
  ]);

  const targetDetails = targetMap.get(type);
  const title = targetDetails?.title ?? null;
  const targetPath =
    targetDetails && 'path' in targetDetails ? targetDetails.path : path;

  return {
    type,
    title,
    linkReference: targetPath
      ? idToResourceReference(Target, type, `${basePath}/${targetPath}`)
      : null,
  };
};

const mapLinkedItemTransform = (
  data: LinkedItemListItem,
  basePath: string,
  linkId: string,
  resourceName: string
): LinkedItemResponse => {
  const createdBy = data.CreatedByUser
    ? idToResourceReference(data.CreatedByUser, 'user', `${basePath}/users`)
    : null;
  const updatedBy = data.ModifiedByUser
    ? idToResourceReference(data.ModifiedByUser, 'user', `${basePath}/users`)
    : createdBy;

  const {
    type = data?.target_node?.ObjectType || null,
    title = null,
    linkReference = null,
  } = mapTargetItem(data, basePath) || {};
  const linkedItemResourcePath = `${basePath}/${resourceName}/${linkId}/linked-items`;
  const baseLinks = buildBaseLinks(
    linkedItemResourcePath,
    data.Id,
    { createdBy, updatedBy },
    { ownerData: [], contributorData: [] }
  );

  return {
    id: data.Id,
    linkedItemId: data.Target,
    linkedItemTitle: title,
    linkedItemType: type,
    relationshipType: data.RelationshipType || null,
    createdAt: data.CreatedAtTimestamp,
    updatedAt: data.ModifiedAtTimestamp ?? data.CreatedAtTimestamp,
    createdBy: data.CreatedByUser || null,
    updatedBy: data.ModifiedByUser || data.CreatedByUser || null,
    links: { parents: [], linkedItem: linkReference, ...baseLinks, self: null },
  };
};

export const transformLinkedItemListQueryResponse: TransformLinkedItemListFn = (
  linkedItems,
  opts
) => {
  const { basePath, linkId, resourceName } = opts;
  if (!linkId || !resourceName) {
    throw new Error(
      'Link ID and resource name required for linked item transforms'
    );
  }

  const transformedInput = linkedItems.data.map((linkedItem) => {
    return mapLinkedItemTransform(linkedItem, basePath, linkId, resourceName);
  });

  return resourceSchemas.LinkedItemListSchema.parse(transformedInput);
};

export type TransformLinkedItemListFn = ListDataTransformFn<
  LinkedItemsListResponse['linkedItem'],
  LinkedItemListResponse
>;
