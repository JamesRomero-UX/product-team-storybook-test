import type { CollectionPreferencesProps } from '@risk-smart/themed-cloudscape-components/collection-preferences';
import { groupByDatePrecision } from '@risksmart-app/shared/reporting/api/schema';
import { aggregateType } from '@risksmart-app/shared/reporting/schema';
import { z } from 'zod';

import { titleSchema } from '../../universal-widget/settingsSchema';
import { getAggregateTypeConfig } from './aggregationTypeOptions';
import { getChartTypeConfig } from './chartTypesOptions';

export const Precision = ['day', 'month', 'year'];

export const chartTypes = [
  'bar',
  'pie',
  'donut',
  'table',
  'kpi',
  'stacked-bar',
  'radar',
] as const;
const chartTypeSchema = z.enum(chartTypes, { message: 'Required' });

export type ChartType = z.infer<typeof chartTypeSchema>;

export const customDataSourceWidgetSettingsSchema = z
  .object({
    customDataSourceId: z
      .string({ invalid_type_error: 'Required' })
      .uuid({ message: 'Required' }),
    chartType: chartTypeSchema,
    x1FieldId: z.string().nullish(),
    x1FieldDatePrecision: groupByDatePrecision.nullish(),
    x2FieldId: z.string().nullish(),
    aggregationType: aggregateType.nullish(),
    yFieldId: z.string().nullish(),
    tablePreferences: z
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .custom<CollectionPreferencesProps.Preferences<any>>()
      .optional(),
    showAsPercentage: z.boolean().optional(),
  })
  .and(titleSchema)
  .superRefine((values, ctx) => {
    const aggregateTypeConfig = getAggregateTypeConfig();
    const chartTypeConfig = getChartTypeConfig();
    const chartType = chartTypeConfig[values.chartType];

    if (values.x1FieldId && values.x1FieldId === values.x2FieldId) {
      ctx.addIssue({
        path: ['x2FieldId'],
        code: 'custom',
        message: 'Field must be different to category',
      });
    }

    if (chartType.category && !values.x1FieldId) {
      ctx.addIssue({
        path: ['x1FieldId'],
        code: 'custom',
        message: 'Required',
      });
    }
    if (chartType.aggregation && !values.aggregationType) {
      ctx.addIssue({
        path: ['aggregationType'],
        code: 'custom',
        message: 'Required',
      });
    }

    if (
      values.aggregationType &&
      aggregateTypeConfig[values.aggregationType].isYFieldRequired &&
      !values.yFieldId
    ) {
      ctx.addIssue({
        path: ['yFieldId'],
        code: 'custom',
        message: 'Required',
      });
    }
  });

export type CustomDataSourceWidgetSettings = z.infer<
  typeof customDataSourceWidgetSettingsSchema
>;

export const defaultValues: CustomDataSourceWidgetSettings = {
  customDataSourceId: undefined as unknown as string,
  chartType: undefined as unknown as 'bar',
  x1FieldId: undefined,
  x1FieldDatePrecision: undefined,
  yFieldId: undefined,
  aggregationType: undefined,
  tablePreferences: undefined,
  showAsPercentage: false,
};
