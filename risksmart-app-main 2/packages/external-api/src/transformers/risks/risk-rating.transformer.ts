import type {
  RiskListRatingResponse,
  RiskRatingByIdResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  BaseRiskRatingSchemaResponse,
  RiskRatingListResponse,
  RiskRatingResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import { idToResourceReference } from '../../utils/transforms';
import { buildBaseLinks, transformParents } from '../common/base.transformer';

type InputData = NonNullable<RiskRatingByIdResponse>['riskAssessmentResult'];

const mapRiskRatingBaseTransform = (
  data: InputData,
  links: ReturnType<typeof createBaseLinks>
): BaseRiskRatingSchemaResponse => {
  return {
    id: data.Id,
    createdAt: data.CreatedAtTimestamp,
    updatedAt: data.ModifiedAtTimestamp ?? data.CreatedAtTimestamp,
    createdBy: data.CreatedByUser,
    updatedBy: data.ModifiedByUser || data.CreatedByUser,
    owners: [],
    contributors: [],
    tags: [],
    links,
  };
};

const createBaseLinks = (data: InputData, basePath: string, riskId: string) => {
  const createdBy = data.CreatedByUser
    ? idToResourceReference(data.CreatedByUser, 'user', `${basePath}/users`)
    : null;
  const updatedBy = data.ModifiedByUser
    ? idToResourceReference(data.ModifiedByUser, 'user', `${basePath}/users`)
    : createdBy;
  const ratingResourcePath = `${basePath}/risks/${riskId}/ratings`;
  const baseLinks = buildBaseLinks(
    ratingResourcePath,
    data.Id,
    { createdBy, updatedBy },
    { ownerData: [], contributorData: [] }
  );
  const parents = transformParents(
    data.parents.map(({ ParentId, ParentType }) => ({
      parent: { Id: ParentId, ObjectType: ParentType },
    })),
    basePath
  );

  return { ...baseLinks, parents };
};

export const transformRatingsItemResponse: TransformRiskRatingItemFn = (
  rating,
  opts
) => {
  const { basePath, linkId } = opts;
  if (!linkId) {
    throw new Error('Link ID required for risk rating transforms');
  }
  const baseLinks = createBaseLinks(rating, basePath, linkId);
  const baseEntity = mapRiskRatingBaseTransform(rating, baseLinks);
  const transformedInput: RiskRatingResponse = {
    ...baseEntity,
    controlType: rating.ControlType,
    likelihood: rating.Likelihood,
    impact: rating.Impact,
    rating: rating.Rating,
    ratingType: rating.RatingType,
    testDate: rating.TestDate,
    rationale: rating.Rationale,
  };

  return resourceSchemas.RiskRatingItemSchema.parse(transformedInput);
};

export const transformRatingsListQueryResponse: TransformRiskRatingsListFn = (
  ratings,
  opts
) => {
  const { basePath, linkId } = opts;
  if (!linkId) {
    throw new Error('Link ID required for risk rating transforms');
  }
  const transformedInput = ratings.data.map((rating) => {
    const baseLinks = createBaseLinks(rating, basePath, linkId);

    return mapRiskRatingBaseTransform(rating, baseLinks);
  });

  return resourceSchemas.RiskRatingListSchema.parse(transformedInput);
};

export type TransformRiskRatingsListFn = ListDataTransformFn<
  RiskListRatingResponse['riskAssessmentResult'],
  RiskRatingListResponse
>;

export type TransformRiskRatingItemFn = DataEntityTransformFn<
  InputData,
  RiskRatingResponse
>;
