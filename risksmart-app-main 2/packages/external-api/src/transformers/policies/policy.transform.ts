import type {
  DocumentByIdResponse,
  DocumentListQueryResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  PolicyItemResponse,
  PolicyListResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import { idToResourceReference } from '../../utils/transforms';
import {
  type BaseEntityInput,
  transformBaseEntity,
} from '../common/base.transformer';

type InputData =
  | NonNullable<DocumentByIdResponse>['document']
  | DocumentListQueryResponse['document'][0];

// Map policy-specific field names to base entity structure
const mapPolicyToBaseEntity = (data: InputData): BaseEntityInput => ({
  Id: data.Id,
  SequentialId: data.SequentialId,
  Title: data.Title,
  Description: data.Purpose,
  CreatedAtTimestamp: data.CreatedAtTimestamp,
  ModifiedAtTimestamp: data.ModifiedAtTimestamp,
  CreatedByUser: data.CreatedByUser,
  ModifiedByUser: data.ModifiedByUser,
  owners: data.owners,
  contributors: data.contributors,
  tags: data.tags,
});

export type TransformPoliciesListFn = ListDataTransformFn<
  DocumentListQueryResponse['document'],
  PolicyListResponse[]
>;

export type TransformPolicyItemFn = DataEntityTransformFn<
  NonNullable<DocumentByIdResponse>['document'],
  PolicyItemResponse
>;

export const transformItem: TransformPolicyItemFn = (document, opts) => {
  const { basePath } = opts;
  const baseEntity = mapPolicyToBaseEntity(document);
  const { baseData, links } = transformBaseEntity(
    baseEntity,
    basePath,
    'policies'
  );

  return resourceSchemas.PolicyItemResponseSchema.parse({
    ...baseData,
    type: document.DocumentType,
    links,
  });
};

export const transformListQueryResponse: TransformPoliciesListFn = (
  result,
  opts
) => {
  const { basePath } = opts;

  return result.data.map((document) => {
    const baseEntity = mapPolicyToBaseEntity(document);
    const { baseData, links } = transformBaseEntity(
      baseEntity,
      basePath,
      'policies'
    );
    const parents = document.parent
      ? [
          idToResourceReference(
            document.parent.Id,
            'policy',
            `${basePath}/policies`
          ),
        ]
      : [];

    return resourceSchemas.PolicyListResponseSchema.parse({
      ...baseData,
      links: {
        ...links,
        parents,
      },
    });
  });
};
