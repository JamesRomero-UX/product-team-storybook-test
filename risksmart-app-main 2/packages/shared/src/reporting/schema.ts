import { z } from 'zod';

export const dataSourceTypes = [
  'risks',
  'actions',
  'attestationRecords',
  'issues',
  'controls',
  'documents',
  'documentVersions',
  'tags',
  'appetites',
  'acceptances',
  'indicators',
  'indicatorResults',
  'causes',
  'consequences',
  'testResults',
  'riskAssessmentResults',
  'assessments',
  'activities',
  'rcsaActivities',
  'obligations',
  'thirdParties',
  'responses',
  'questionnaires',
] as const;

export const dataSourceTypeSchema = z.enum(dataSourceTypes, {
  invalid_type_error: 'Required',
});

export type DataSourceType = z.infer<typeof dataSourceTypeSchema>;

export const selectedDatasourceSchema = z.object({
  type: dataSourceTypeSchema,
  /**
   * Parent datasource to join with
   */
  parentIndex: z.number().int().optional(),
});

export type SelectedDatasource = z.infer<typeof selectedDatasourceSchema>;

export const aggregateType = z.enum([
  'min',
  'max',
  'count',
  'avg',
  'sum',
  'distinctCount',
]);

export type AggregateType = z.infer<typeof aggregateType>;

export const joinType = z.enum(['inner', 'left']);

export type JoinType = z.infer<typeof joinType>;
