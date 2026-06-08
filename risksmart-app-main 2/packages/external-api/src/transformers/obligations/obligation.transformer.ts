import type {
  ObligationByIdResponse,
  ObligationListQueryResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  ObligationItemResponse,
  ObligationListResponse,
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
  | NonNullable<ObligationByIdResponse>['obligation']
  | ObligationListQueryResponse['obligation'][0];

// Map obligation-specific field names to base entity structure
const mapObligationToBaseEntity = (data: InputData): BaseEntityInput => ({
  Id: data.Id,
  SequentialId: data.SequentialId,
  Title: data.Title,
  Description: data.Description,
  CreatedAtTimestamp: data.CreatedAtTimestamp,
  ModifiedAtTimestamp: data.ModifiedAtTimestamp,
  CreatedByUser: data.CreatedByUser,
  ModifiedByUser: data.ModifiedByUser,
  owners: data.owners,
  contributors: data.contributors,
  tags: data.tags,
});

export type TransformObligationsListFn = ListDataTransformFn<
  ObligationListQueryResponse['obligation'],
  ObligationListResponse[]
>;

export type TransformObligationItemFn = DataEntityTransformFn<
  NonNullable<ObligationByIdResponse>['obligation'],
  ObligationItemResponse
>;

// maps data to single item response.
export const transformItem: TransformObligationItemFn = (obligation, opts) => {
  const { basePath } = opts;
  const baseEntity = mapObligationToBaseEntity(obligation);
  const { baseData, links } = transformBaseEntity(
    baseEntity,
    basePath,
    'compliance/obligations'
  );

  const responseData: ObligationItemResponse = {
    ...baseData,
    type: obligation.Type,
    interpretation: obligation.Interpretation,
    adherence: obligation.Adherence,
    links,
  };

  return resourceSchemas.ObligationItemResponseSchema.parse(responseData);
};

// maps data to list item response.
export const transformListQueryResponse: TransformObligationsListFn = (
  result,
  opts
) => {
  const { basePath } = opts;

  return result.data.map((obligation) => {
    const baseEntity = mapObligationToBaseEntity(obligation);
    const { baseData, links } = transformBaseEntity(
      baseEntity,
      basePath,
      'compliance/obligations'
    );

    // Obligations have a single parent field (ParentId), convert to parents array
    const parents = obligation.parent?.Id
      ? [
          idToResourceReference(
            obligation.parent.Id,
            'obligation',
            `${basePath}/compliance/obligations`
          ),
        ]
      : [];

    return resourceSchemas.ObligationListResponseSchema.parse({
      ...baseData,
      links: {
        ...links,
        parents,
      },
    });
  });
};
