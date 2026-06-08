import type {
  DepartmentTypeByIdResponse,
  DepartmentTypeListQueryResponse,
} from '../../clients/client.interface';
import type {
  DepartmentItemResponse,
  DepartmentListResponse,
} from '../../schemas/departments/department.schema';
import { resourceSchemas } from '../../schemas/index';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import { idToResourceReference } from '../../utils/transforms';

export type TransformDepartmentListFn = ListDataTransformFn<
  DepartmentTypeListQueryResponse['departmentType'],
  DepartmentListResponse[]
>;

export type TransformDepartmentItemFn = DataEntityTransformFn<
  NonNullable<DepartmentTypeByIdResponse>['departmentType'],
  DepartmentItemResponse
>;

export const transformListQueryResponse: TransformDepartmentListFn = (
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

    return resourceSchemas.DepartmentListResponseSchema.parse({
      id: item.DepartmentTypeId,
      name: item.Name,
      description: item.Description ?? null,
      createdAt: item.CreatedAtTimestamp ?? null,
      updatedAt: item.ModifiedAtTimestamp ?? item.CreatedAtTimestamp ?? null,
      createdBy: item.CreatedByUser ?? null,
      updatedBy: item.ModifiedByUser ?? item.CreatedByUser ?? null,
      links: {
        self: { href: `${basePath}/departments/${item.DepartmentTypeId}` },
        createdBy: createdByRef,
        updatedBy: updatedByRef,
      },
    });
  });
};

export const transformItem: TransformDepartmentItemFn = (
  data,
  { basePath }
) => {
  const createdByRef = data.CreatedByUser
    ? idToResourceReference(data.CreatedByUser, 'user', `${basePath}/users`)
    : null;
  const updatedByRef = data.ModifiedByUser
    ? idToResourceReference(data.ModifiedByUser, 'user', `${basePath}/users`)
    : createdByRef;

  const departmentGroupRef = data.DepartmentTypeGroupId
    ? idToResourceReference(
        data.DepartmentTypeGroupId,
        'department-group',
        `${basePath}/department-groups`
      )
    : null;

  return resourceSchemas.DepartmentItemResponseSchema.parse({
    id: data.DepartmentTypeId,
    name: data.Name,
    description: data.Description ?? null,
    createdAt: data.CreatedAtTimestamp,
    updatedAt: data.ModifiedAtTimestamp ?? data.CreatedAtTimestamp,
    createdBy: data.CreatedByUser ?? null,
    updatedBy: data.ModifiedByUser ?? data.CreatedByUser,
    departmentGroupId: data.DepartmentTypeGroupId ?? null,
    links: {
      self: { href: `${basePath}/departments/${data.DepartmentTypeId}` },
      createdBy: createdByRef,
      updatedBy: updatedByRef,
      departmentGroup: departmentGroupRef,
    },
  });
};
