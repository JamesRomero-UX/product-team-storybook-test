import type {
  AssessmentByIdResponse,
  AssessmentListQueryResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  AssessmentItemResponse,
  AssessmentListResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import {
  type BaseEntityInput,
  transformBaseEntity,
} from '../common/base.transformer';

type InputData =
  | NonNullable<AssessmentByIdResponse>['assessment']
  | AssessmentListQueryResponse['assessment'][0];

// Map assessment-specific field names to base entity structure
const mapAssessmentToBaseEntity = (data: InputData): BaseEntityInput => ({
  Id: data.Id,
  SequentialId: data.SequentialId,
  Title: data.Title,
  Description: data.Summary,
  CreatedAtTimestamp: data.CreatedAtTimestamp,
  ModifiedAtTimestamp: data.ModifiedAtTimestamp,
  CreatedByUser: data.CreatedByUser,
  ModifiedByUser: data.ModifiedByUser,
  owners: data.owners,
  contributors: data.contributors,
  tags: data.tags,
});

export const transformItem: TransformAssessmentItemFn = (assessment, opts) => {
  const { basePath } = opts;
  const baseEntity = mapAssessmentToBaseEntity(assessment);
  const { baseData, links: baseLinks } = transformBaseEntity(
    baseEntity,
    basePath,
    'assessments'
  );
  const { linkedItems: _, ...links } = baseLinks;

  return resourceSchemas.AssessmentItemResponseSchema.parse({
    ...baseData,
    status: assessment.Status,
    startDate: assessment.StartDate,
    endDate: assessment.TargetCompletionDate,
    completionDate: assessment.ActualCompletionDate,
    links,
  });
};

export const transformListQueryResponse: TransformAssessmentsListFn = (
  result,
  opts
) => {
  const { basePath } = opts;

  return result.data.map((assessment) => {
    const baseEntity = mapAssessmentToBaseEntity(assessment);
    const { baseData, links: baseLinks } = transformBaseEntity(
      baseEntity,
      basePath,
      'assessments'
    );

    const { linkedItems: _, ...links } = baseLinks;

    return resourceSchemas.AssessmentListResponseSchema.parse({
      ...baseData,
      links: {
        ...links,
        parents: [], // Assessments don't have direct parent relationships
      },
    });
  });
};

export type TransformAssessmentsListFn = ListDataTransformFn<
  AssessmentListQueryResponse['assessment'],
  AssessmentListResponse[]
>;

export type TransformAssessmentItemFn = DataEntityTransformFn<
  NonNullable<AssessmentByIdResponse>['assessment'],
  AssessmentItemResponse
>;
