import type {
  DepartmentGroupTypeByIdResponse,
  DepartmentGroupTypeListQueryResponse,
} from '../../clients/client.interface';
import type {
  DepartmentGroupItemResponse,
  DepartmentGroupListResponse,
} from '../../schemas/department-groups/department-group.schema';
import { resourceSchemas } from '../../schemas/index';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import { idToResourceReference } from '../../utils/transforms';

export type TransformDepartmentGroupListFn = ListDataTransformFn<
  DepartmentGroupTypeListQueryResponse['departmentGroupType'],
  DepartmentGroupListResponse[]
>;

export type TransformDepartmentGroupItemFn = DataEntityTransformFn<
  NonNullable<DepartmentGroupTypeByIdResponse>['departmentGroupType'],
  DepartmentGroupItemResponse
>;

export const transformListQueryResponse: TransformDepartmentGroupListFn = (
  result,
  { basePath }
) => {
  return result.data.map((item) => {
    const createdByRef = item.CreatedByUser
      ? idToResourceReference(item.CreatedByUser, 'user', `${basePath}/users`)
      : null;
    const updatedByRef = item.ModifiedByUser
      ? idToResourceReference(item.ModifiedByUser, 'user', `${basePath}/users`)
      : createdByRef;

    return resourceSchemas.DepartmentGroupListResponseSchema.parse({
      id: item.Id,
      name: item.Name,
      createdAt: item.CreatedAtTimestamp ?? null,
      updatedAt: item.ModifiedAtTimestamp ?? item.CreatedAtTimestamp ?? null,
      createdBy: item.CreatedByUser ?? null,
      updatedBy: item.ModifiedByUser ?? item.CreatedByUser ?? null,
      links: {
        self: { href: `${basePath}/department-groups/${item.Id}` },
        createdBy: createdByRef,
        updatedBy: updatedByRef,
      },
    });
  });
};

export const transformItem: TransformDepartmentGroupItemFn = (
  data,
  { basePath }
) => {
  const createdByRef = data.CreatedByUser
    ? idToResourceReference(data.CreatedByUser, 'user', `${basePath}/users`)
    : null;
  const updatedByRef = data.ModifiedByUser
    ? idToResourceReference(data.ModifiedByUser, 'user', `${basePath}/users`)
    : createdByRef;

  return resourceSchemas.DepartmentGroupItemResponseSchema.parse({
    id: data.Id,
    name: data.Name,
    createdAt: data.CreatedAtTimestamp ?? null,
    updatedAt: data.ModifiedAtTimestamp ?? data.CreatedAtTimestamp ?? null,
    createdBy: data.CreatedByUser ?? null,
    updatedBy: data.ModifiedByUser ?? data.CreatedByUser ?? null,
    links: {
      self: { href: `${basePath}/department-groups/${data.Id}` },
      createdBy: createdByRef,
      updatedBy: updatedByRef,
    },
  });
};
