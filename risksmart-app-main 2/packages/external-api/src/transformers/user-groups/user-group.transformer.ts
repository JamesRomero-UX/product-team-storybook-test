import type {
  UserGroupByIdResponse,
  UserGroupListQueryResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  UserGroupItemResponse,
  UserGroupListResponse,
} from '../../schemas/user-groups/user-group.schema';
import type { ListDataTransformFn } from '../../types/transform';

export type TransformUserGroupListFn = ListDataTransformFn<
  UserGroupListQueryResponse['userGroup'],
  UserGroupListResponse[]
>;

export type TransformUserGroupItemFn = (
  data: NonNullable<UserGroupByIdResponse>['userGroup']
) => UserGroupItemResponse;

export const transformListQueryResponse: TransformUserGroupListFn = (
  result
) => {
  return result.data.map((item) =>
    resourceSchemas.UserGroupListResponseSchema.parse({
      id: item.Id,
      name: item.Name,
      description: item.Description ?? null,
      ownerContributor: item.OwnerContributor,
      createdAt: item.CreatedAtTimestamp,
      updatedAt: item.ModifiedAtTimestamp ?? item.CreatedAtTimestamp,
    })
  );
};

export const transformItem: TransformUserGroupItemFn = (data) => {
  return resourceSchemas.UserGroupItemResponseSchema.parse({
    id: data.Id,
    name: data.Name,
    description: data.Description ?? null,
    ownerContributor: data.OwnerContributor,
    createdAt: data.CreatedAtTimestamp,
    updatedAt: data.ModifiedAtTimestamp ?? data.CreatedAtTimestamp,
    approvers: (data.approvers ?? []).map((approver) => ({
      id: approver.Id,
    })),
  });
};
