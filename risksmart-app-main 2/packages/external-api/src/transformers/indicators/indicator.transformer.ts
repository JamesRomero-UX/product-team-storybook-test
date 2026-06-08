import type {
  IndicatorByIdResponse,
  IndicatorListQueryResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  IndicatorItemResponse,
  IndicatorListResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import { pathResourceReference } from '../../utils/transforms';
import {
  type BaseEntityInput,
  transformBaseEntity,
  transformParents,
} from '../common/base.transformer';

type InputData =
  | NonNullable<IndicatorByIdResponse>['indicator']
  | IndicatorListQueryResponse['indicator'][0];

// Map indicator specific field names to base entity structure
const mapIndicatorToBaseEntity = (data: InputData): BaseEntityInput => ({
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

const mapIndicatorScheduleAndState = ({
  schedule,
  scheduleState,
}: NonNullable<IndicatorByIdResponse>['indicator']) => {
  const {
    Frequency = null,
    ManualDueDate = null,
    StartDate = null,
    TimeToCompleteUnit = null,
    TimeToCompleteValue = null,
  } = schedule || {};
  const {
    LatestDate = null,
    DueDate = null,
    OverdueDate = null,
  } = scheduleState || {};

  return {
    schedule: {
      frequency: Frequency,
      manualDueDate: ManualDueDate,
      startDate: StartDate,
      timeToCompleteValue: TimeToCompleteValue,
      timeToCompleteUnit: TimeToCompleteUnit,
    },
    scheduleState: {
      latestDate: LatestDate,
      dueDate: DueDate,
      overdueDate: OverdueDate,
    },
  };
};

export const transformItem: TransformIndicatorItemFn = (indicator, opts) => {
  const { basePath } = opts;
  const baseEntity = mapIndicatorToBaseEntity(indicator);
  const { baseData, links } = transformBaseEntity(
    baseEntity,
    basePath,
    'indicators'
  );

  return resourceSchemas.IndicatorItemResponseSchema.parse({
    ...baseData,
    type: indicator.Type,
    unit: indicator.Unit,
    targetValue: indicator.TargetValueTxt,
    upperTolerance: indicator.UpperToleranceNum,
    lowerTolerance: indicator.LowerToleranceNum,
    upperAppetite: indicator.UpperAppetiteNum,
    lowerAppetite: indicator.LowerAppetiteNum,
    ...mapIndicatorScheduleAndState(indicator),
    links: {
      ...links,
      results: pathResourceReference(
        'results',
        `${basePath}/indicators/${indicator.Id}`
      ),
    },
  });
};

export const transformListQueryResponse: TransformIndicatorsListFn = (
  result,
  opts
) => {
  const { basePath } = opts;

  return result.data.map((indicator) => {
    const baseEntity = mapIndicatorToBaseEntity(indicator);
    const { baseData, links } = transformBaseEntity(
      baseEntity,
      basePath,
      'indicators'
    );
    const parents = transformParents(indicator.parents, basePath);

    return resourceSchemas.IndicatorListResponseSchema.parse({
      ...baseData,
      links: {
        ...links,
        parents,
        results: pathResourceReference(
          'results',
          `${basePath}/indicators/${indicator.Id}`
        ),
      },
    });
  });
};

export type TransformIndicatorsListFn = ListDataTransformFn<
  IndicatorListQueryResponse['indicator'],
  IndicatorListResponse[]
>;

export type TransformIndicatorItemFn = DataEntityTransformFn<
  NonNullable<IndicatorByIdResponse>['indicator'],
  IndicatorItemResponse
>;
