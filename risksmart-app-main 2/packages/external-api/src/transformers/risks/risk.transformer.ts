import type {
  RiskByIdResponse,
  RiskListQueryResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  RiskListItemResponse,
  RiskRatingListResponse,
  RiskResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import {
  firstDefined,
  idToResourceReference,
  pathResourceReference,
} from '../../utils/transforms';
import {
  type BaseEntityInput,
  transformBaseEntity,
} from '../common/base.transformer';

const SYSTEM_UNKNOWN_TEXT = 'unknown';

// Extract the specific types from the tRPC responses
type DataInput =
  | RiskListQueryResponse['risk'][0]
  | NonNullable<RiskByIdResponse>['risk'];

// Map risk-specific field names to base entity structure
const mapRiskToBaseEntity = (risk: DataInput): BaseEntityInput => ({
  Id: risk.Id,
  SequentialId: risk.SequentialId,
  Title: risk.Title,
  Description: risk.Description,
  CreatedAtTimestamp: risk.CreatedAtTimestamp,
  ModifiedAtTimestamp: risk.ModifiedAtTimestamp,
  CreatedByUser: risk.CreatedByUser,
  ModifiedByUser: risk.ModifiedByUser,
  owners: risk.owners,
  contributors: risk.contributors,
  tags: risk.tags,
});

const mapRiskScore = (risk: DataInput) => {
  const riskScoreData = risk.riskScore;

  return {
    residualScore: riskScoreData?.ResidualScore ?? null,
    residualRating: riskScoreData?.ResidualRating ?? null,
    inherentScore: riskScoreData?.InherentScore ?? null,
    inherentRating: riskScoreData?.InherentRating ?? null,
    residualImpact: riskScoreData?.ResidualImpact ?? null,
    residualLikelihood: riskScoreData?.ResidualLikelihood ?? null,
    inherentImpact: riskScoreData?.InherentImpact ?? null,
    inherentLikelihood: riskScoreData?.InherentLikelihood ?? null,
  };
};

const mapScheduleAndState = ({
  schedule,
  scheduleState,
}: NonNullable<RiskByIdResponse>['risk']) => {
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

// Generic transform function for shared risk-specific logic
function transformRiskBase(risk: DataInput, basePath: string) {
  const baseEntity = mapRiskToBaseEntity(risk);
  const { baseData, links } = transformBaseEntity(
    baseEntity,
    basePath,
    'risks'
  );
  const parentId =
    firstDefined(risk.ParentRiskId, risk.parent?.Id, risk.parentNode?.Id) ??
    null;

  const parents = parentId
    ? [idToResourceReference(parentId, 'risk', `${basePath}/risks`)]
    : [];
  const riskBasePath = `${basePath}/risks/${risk.Id}`;
  const nestedListLinks = {
    controls: pathResourceReference('controls', riskBasePath),
    ratings: pathResourceReference('ratings', riskBasePath),
    appetites: pathResourceReference('appetites', riskBasePath),
    actions: pathResourceReference('actions', riskBasePath),
    indicators: pathResourceReference('indicators', riskBasePath),
    impacts: pathResourceReference('impacts', riskBasePath),
    acceptances: pathResourceReference('acceptances', riskBasePath),
    approvals: pathResourceReference('approvals', riskBasePath),
  };
  const riskScore = mapRiskScore(risk);

  return {
    ...baseData,
    tier: risk.Tier,
    status: risk.Status || SYSTEM_UNKNOWN_TEXT,
    treatment: risk.Treatment || SYSTEM_UNKNOWN_TEXT,
    riskScore: { ...riskScore },
    links: {
      ...links,
      parents,
      ...nestedListLinks,
    },
  };
}

export const transformRiskListQueryResponse: TransformRisksListFn = (
  result,
  props
) => {
  const { basePath } = props;

  return resourceSchemas.RiskListSchema.parse(
    result.data.map((risk): RiskListItemResponse => {
      const baseTransform = transformRiskBase(risk, basePath);

      return {
        ...baseTransform,
      };
    })
  );
};

export const transformRiskByIdResponse: TransformRiskItemFn = (risk, props) => {
  const { basePath } = props;
  const baseTransform = transformRiskBase(risk, basePath);
  const scheduleAndState = mapScheduleAndState(risk);

  return resourceSchemas.RiskSchema.parse({
    ...baseTransform,
    ...scheduleAndState,
  });
};

export type TransformRisksListFn = ListDataTransformFn<
  RiskListQueryResponse['risk'],
  RiskRatingListResponse
>;

export type TransformRiskItemFn = DataEntityTransformFn<
  NonNullable<RiskByIdResponse>['risk'],
  RiskResponse
>;
