import type {
  EnterpriseRiskByIdResponse,
  EnterpriseRiskListQueryResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  EnterpriseRiskItemResponse,
  EnterpriseRiskListResponse,
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
  | NonNullable<EnterpriseRiskByIdResponse>['enterpriseRisk']
  | EnterpriseRiskListQueryResponse['enterpriseRisk'][0];

// Map enterprise risk-specific field names to base entity structure
const mapEnterpriseRiskToBaseEntity = (data: InputData): BaseEntityInput => ({
  Id: data.Id,
  SequentialId: data.SequentialId,
  Title: data.Title,
  Description: data.Description,
  CreatedAtTimestamp: data.CreatedAtTimestamp,
  ModifiedAtTimestamp: data.ModifiedAtTimestamp,
  CreatedByUser: data.CreatedByUser,
  ModifiedByUser: data.ModifiedByUser,
  owners: [],
  contributors: [],
});

export type TransformEnterpriseRisksListFn = ListDataTransformFn<
  EnterpriseRiskListQueryResponse['enterpriseRisk'],
  EnterpriseRiskListResponse[]
>;

export type TransformEnterpriseRiskItemFn = DataEntityTransformFn<
  NonNullable<EnterpriseRiskByIdResponse>['enterpriseRisk'],
  EnterpriseRiskItemResponse
>;

// maps data to single item response.
export const transformItem: TransformEnterpriseRiskItemFn = (
  enterpriseRisk,
  opts
) => {
  const { basePath } = opts;
  const baseEntity = mapEnterpriseRiskToBaseEntity(enterpriseRisk);
  const { baseData, links } = transformBaseEntity(
    baseEntity,
    basePath,
    'enterprise-risks'
  );

  const score = enterpriseRisk.score
    ? {
        inherentScoreMean: enterpriseRisk.score.InherentScoreMean ?? null,
        residualScoreMean: enterpriseRisk.score.ResidualScoreMean ?? null,
        inherentRatingMean: enterpriseRisk.score.InherentRatingMean ?? null,
        residualRatingMean: enterpriseRisk.score.ResidualRatingMean ?? null,
      }
    : null;

  return resourceSchemas.EnterpriseRiskItemResponseSchema.parse({
    ...baseData,
    tier: enterpriseRisk.Tier,
    treatment: enterpriseRisk.Treatment ?? null,
    score,
    links,
  });
};

// maps data to list item response.
export const transformListQueryResponse: TransformEnterpriseRisksListFn = (
  result,
  opts
) => {
  const { basePath } = opts;

  return result.data.map((enterpriseRisk) => {
    const baseEntity = mapEnterpriseRiskToBaseEntity(enterpriseRisk);
    const { baseData, links } = transformBaseEntity(
      baseEntity,
      basePath,
      'enterprise-risks'
    );

    // Enterprise risks have a single parent field (ParentId), convert to parents array
    const parents = enterpriseRisk.parent?.Id
      ? [
          idToResourceReference(
            enterpriseRisk.parent.Id,
            'enterprise-risk',
            `${basePath}/enterprise-risks`
          ),
        ]
      : [];

    return resourceSchemas.EnterpriseRiskListResponseSchema.parse({
      ...baseData,
      tier: enterpriseRisk.Tier,
      treatment: enterpriseRisk.Treatment ?? null,
      links: {
        ...links,
        parents,
      },
    });
  });
};
