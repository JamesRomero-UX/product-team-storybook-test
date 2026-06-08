import type {
  ActionByIdResponse,
  ActionListQueryResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  ActionItemResponse,
  ActionListResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import {
  type BaseEntityInput,
  transformBaseEntity,
  transformParents,
} from '../common/base.transformer';

type InputActionData =
  | NonNullable<ActionByIdResponse>['action']
  | ActionListQueryResponse['action'][0];

// Map action-specific field names to base entity structure
const mapActionToBaseEntity = (action: InputActionData): BaseEntityInput => ({
  Id: action.Id,
  SequentialId: action.SequentialId,
  Title: action.Title,
  Description: action.Description,
  CreatedAtTimestamp: action.CreatedAtTimestamp,
  ModifiedAtTimestamp: action.ModifiedAtTimestamp,
  CreatedByUser: action.CreatedByUser,
  ModifiedByUser: action.ModifiedByUser,
  owners: action.owners,
  contributors: action.contributors,
  tags: action.tags,
});

export const transformActionItem: TransformActionItemFn = (action, opts) => {
  const { basePath } = opts;
  const baseEntity = mapActionToBaseEntity(action);
  const { baseData, links } = transformBaseEntity(
    baseEntity,
    basePath,
    'actions'
  );

  return resourceSchemas.ActionItemResponseSchema.parse({
    ...baseData,
    status: action.Status,
    priority: action.Priority,
    links,
  });
};

export const transformActionListQueryResponse: TransformActionsListFn = (
  result,
  opts
) => {
  const { basePath } = opts;

  return result.data.map((action) => {
    const baseEntity = mapActionToBaseEntity(action);
    const { baseData, links } = transformBaseEntity(
      baseEntity,
      basePath,
      'actions'
    );
    const parents = transformParents(action.parents, basePath);

    return resourceSchemas.ActionListResponseSchema.parse({
      ...baseData,
      status: action.Status,
      links: {
        ...links,
        parents,
      },
    });
  });
};

export type TransformActionItemFn = DataEntityTransformFn<
  NonNullable<ActionByIdResponse>['action'],
  ActionItemResponse
>;

export type TransformActionsListFn = ListDataTransformFn<
  ActionListQueryResponse['action'],
  ActionListResponse[]
>;
