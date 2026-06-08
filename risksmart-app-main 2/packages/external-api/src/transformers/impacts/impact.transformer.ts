import type {
  ImpactByIdResponse,
  ImpactListQueryResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  ImpactItemResponse,
  ImpactListResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import { idToResourceReference } from '../../utils/transforms';
import {
  type BaseEntityInput,
  transformBaseEntity,
  transformParents,
} from '../common/base.transformer';

type InputData = NonNullable<ImpactByIdResponse>['impact'];

// Map impact-specific field names to base entity structure
// Note: for api consistency: Name -> Title ("title"), Rationale -> Description ("description")
const mapImpactToBaseEntity = (data: InputData): BaseEntityInput => ({
  Id: data.Id,
  SequentialId: data.SequentialId,
  Title: data.Name, // Map Name to Title for base entity
  Description: data.Rationale, // Map Rationale to Description for base entity
  CreatedAtTimestamp: data.CreatedAtTimestamp,
  ModifiedAtTimestamp: data.ModifiedAtTimestamp,
  CreatedByUser: data.CreatedByUser,
  ModifiedByUser: data.ModifiedByUser,
  owners: data.owners,
  contributors: data.contributors,
  tags: [],
});

// maps data to single item response.
export const transformItem: TransformImpactItemFn = (impact, opts) => {
  const { basePath } = opts;
  const baseEntity = mapImpactToBaseEntity(impact);
  const { baseData, links: baseLinks } = transformBaseEntity(
    baseEntity,
    basePath,
    'impacts'
  );

  const { linkedItems: _, ...links } = baseLinks;

  // Map ancestor contributors
  const ancestorContributors = (impact.ancestorContributors || []).map(
    (contributor) => ({
      id: contributor.Id,
      objectType: contributor.ObjectType,
      contributorType: contributor.ContributorType,
      ancestorId: contributor.AncestorId,
      userGroupId: contributor.UserGroupId,
      user: contributor.UserId
        ? idToResourceReference(contributor.UserId, 'user', `${basePath}/users`)
        : null,
    })
  );

  // Map appetites to references (janky due to impacts relation to risks).
  const appetites = (impact.appetites || [])
    .map((appetite) => {
      const [firstParent] = appetite.parents;
      if (firstParent?.risk?.Id) {
        return idToResourceReference(
          appetite.Id,
          'appetite',
          `${basePath}/risks/${firstParent.risk.Id}/appetites`
        );
      }

      return null;
    })
    .filter((item) => item !== null);

  const parents = transformParents(impact.parents, basePath);

  return resourceSchemas.ImpactItemResponseSchema.parse({
    ...baseData,
    likelihoodAppetite: impact.LikelihoodAppetite ?? null,
    impactAppetite: impact.ImpactAppetite ?? null,
    ratingGuidance: impact.RatingGuidance ?? null,
    ancestorContributors,
    links: {
      ...links,
      appetites,
      parents,
    },
  });
};

// maps data to list item response.
export const transformListQueryResponse: TransformImpactsListFn = (
  result,
  opts
) => {
  const { basePath } = opts;

  return result.data.map((impact) => {
    const baseEntity = mapImpactToBaseEntity(impact);
    const { baseData, links: baseLinks } = transformBaseEntity(
      baseEntity,
      basePath,
      'impacts'
    );
    const parents = transformParents(impact.parents, basePath);
    const { linkedItems: _, ...links } = baseLinks;

    return resourceSchemas.ImpactListResponseSchema.parse({
      ...baseData,
      links: {
        ...links,
        parents,
      },
    });
  });
};

export type TransformImpactsListFn = ListDataTransformFn<
  ImpactListQueryResponse['impact'],
  ImpactListResponse[]
>;

export type TransformImpactItemFn = DataEntityTransformFn<
  InputData,
  ImpactItemResponse
>;
