import type {
  IndicatorResultByIdResponse,
  IndicatorResultListQueryResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  IndicatorResultItemResponse,
  IndicatorResultListResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import { idToResourceReference } from '../../utils/transforms';
import { buildBaseLinks } from '../common/base.transformer';

type InputData = NonNullable<IndicatorResultByIdResponse>['indicatorResult'];

const mapIndicatorResultBaseTransform = (
  data: InputData,
  links: ReturnType<typeof createBaseLinks>
) => {
  const updatedBy = data.ModifiedByUser || data.CreatedByUser;

  return {
    id: data.Id,
    description: data.Description,
    resultDate: data.ResultDate,
    targetValueText: data.TargetValueTxt,
    targetValueNumber: data.TargetValueNum,
    createdAt: data.CreatedAtTimestamp,
    updatedAt: data.ModifiedAtTimestamp,
    createdBy: data.CreatedByUser,
    updatedBy,
    links,
  };
};

const createBaseLinks = (
  data: InputData,
  basePath: string,
  indicatorId: string
) => {
  const createdBy = data.CreatedByUser
    ? idToResourceReference(data.CreatedByUser, 'user', `${basePath}/users`)
    : null;
  const updatedBy = data.ModifiedByUser
    ? idToResourceReference(data.ModifiedByUser, 'user', `${basePath}/users`)
    : createdBy;
  const resultResourcePath = `${basePath}/indicators/${indicatorId}/results`;

  return buildBaseLinks(
    resultResourcePath,
    data.Id,
    { createdBy, updatedBy },
    { ownerData: [], contributorData: [] }
  );
};

export type TransformIndicatorResultItemFn = DataEntityTransformFn<
  InputData,
  IndicatorResultItemResponse
>;

export type TransformIndicatorResultsListFn = ListDataTransformFn<
  IndicatorResultListQueryResponse['indicatorResult'],
  IndicatorResultListResponse[]
>;

export const transformIndicatorResultItem: TransformIndicatorResultItemFn = (
  indicatorResult,
  opts
) => {
  const { basePath, linkId } = opts;
  if (!linkId) {
    throw new Error(
      'Link ID (indicatorId) required for indicator result transforms'
    );
  }
  const baseLinks = createBaseLinks(indicatorResult, basePath, linkId);
  const baseEntity = mapIndicatorResultBaseTransform(
    indicatorResult,
    baseLinks
  );

  return resourceSchemas.IndicatorResultItemResponseSchema.parse(baseEntity);
};

export const transformIndicatorResultListQueryResponse: TransformIndicatorResultsListFn =
  (result, opts) => {
    const { basePath, linkId } = opts;
    if (!linkId) {
      throw new Error(
        'Link ID (indicatorId) required for indicator result transforms'
      );
    }

    return result.data.map((indicatorResult) => {
      const baseLinks = createBaseLinks(indicatorResult, basePath, linkId);
      const baseEntity = mapIndicatorResultBaseTransform(
        indicatorResult,
        baseLinks
      );
      const parents = indicatorResult.parent
        ? [
            idToResourceReference(
              indicatorResult.parent.Id,
              'indicator',
              `${basePath}/indicators`
            ),
          ]
        : [];

      return resourceSchemas.IndicatorResultListResponseSchema.parse({
        ...baseEntity,
        links: {
          ...baseLinks,
          parents,
        },
      });
    });
  };
