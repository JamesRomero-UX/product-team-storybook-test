import type {
  TagTypeByIdResponse,
  TagTypeListQueryResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  TagItemResponse,
  TagListResponse,
} from '../../schemas/tags/tag.schema';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import { idToResourceReference } from '../../utils/transforms';

export type TransformTagListFn = ListDataTransformFn<
  TagTypeListQueryResponse['tagType'],
  TagListResponse[]
>;

export type TransformTagItemFn = DataEntityTransformFn<
  NonNullable<TagTypeByIdResponse>['tagType'],
  TagItemResponse
>;

export const transformListQueryResponse: TransformTagListFn = (
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

    return resourceSchemas.TagListResponseSchema.parse({
      id: item.TagTypeId,
      name: item.Name,
      description: item.Description ?? null,
      createdAt: item.CreatedAtTimestamp ?? null,
      updatedAt: item.ModifiedAtTimestamp ?? item.CreatedAtTimestamp ?? null,
      createdBy: item.CreatedByUser ?? null,
      updatedBy: item.ModifiedByUser ?? item.CreatedByUser ?? null,
      links: {
        self: { href: `${basePath}/tags/${item.TagTypeId}` },
        createdBy: createdByRef,
        updatedBy: updatedByRef,
      },
    });
  });
};

export const transformItem: TransformTagItemFn = (data, { basePath }) => {
  const createdByRef = data.CreatedByUser
    ? idToResourceReference(data.CreatedByUser, 'user', `${basePath}/users`)
    : null;
  const updatedByRef = data.ModifiedByUser
    ? idToResourceReference(data.ModifiedByUser, 'user', `${basePath}/users`)
    : createdByRef;

  return resourceSchemas.TagItemResponseSchema.parse({
    id: data.TagTypeId,
    name: data.Name,
    description: data.Description ?? null,
    createdAt: data.CreatedAtTimestamp ?? null,
    updatedAt: data.ModifiedAtTimestamp ?? data.CreatedAtTimestamp ?? null,
    createdBy: data.CreatedByUser ?? null,
    updatedBy: data.ModifiedByUser ?? data.CreatedByUser ?? null,
    links: {
      self: { href: `${basePath}/tags/${data.TagTypeId}` },
      createdBy: createdByRef,
      updatedBy: updatedByRef,
    },
  });
};
