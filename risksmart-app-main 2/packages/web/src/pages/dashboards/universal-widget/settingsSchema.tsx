import { z } from 'zod';

export const Precision = ['day', 'month', 'year'];

const simpleChartSettings = z.object({
  chartType: z.enum(['table', 'placemat']),
});

const chartSettings = z.object({
  chartType: z.enum(['bar', 'stacked-bar', 'pie', 'donut', 'radar', 'line']),
  categoryGetter: z.string(),
  subCategoryGetter: z.string().nullish(),
  aggregationType: z.enum(['count', 'sum', 'mean', 'max', 'min']),
  aggregationField: z.string().nullish(),
});

const kpiSettings = z.object({
  chartType: z.literal('kpi'),
  aggregationType: z.enum(['count', 'sum', 'mean', 'max', 'min']),
  aggregationField: z.string().nullish(),
});

const chartTypes = z
  .discriminatedUnion(
    'chartType',
    [simpleChartSettings, chartSettings, kpiSettings],
    {
      errorMap: () => ({ message: 'Required' }),
    }
  )
  .superRefine((data, ctx) => {
    switch (data.chartType) {
      case 'bar':
      case 'pie':
      case 'stacked-bar':
      case 'donut':
      case 'kpi':
      case 'line':
        if (data.aggregationType !== 'count' && !data.aggregationField) {
          ctx.addIssue({
            message: 'Required',
            code: z.ZodIssueCode.custom,
            path: ['aggregationField'],
          });
        }
        break;
    }
  });

export const filterSchema = z.object({ filtering: z.any() });
export type FilterSchema = z.infer<typeof filterSchema>;

export const titleSchema = z.object({
  title: z.string().optional(),
  customTitle: z.boolean().optional(),
});
export type TitleSchema = z.infer<typeof titleSchema>;

export const settingsSchema = z
  .object({
    dataSource: z.string(),

    precision: z.enum(Precision as [string, ...string[]]).optional(),

    showFilters: z.boolean().default(true),
    showAsPercentage: z.boolean().optional(),
    ignoreDashboardDateFilter: z.boolean().default(false),
    customUnit: z.boolean().optional(),
    unit: z.string().default('Total'),
    invertBarChartAxis: z.boolean().optional(),
    preferences: z.any().optional(),
    allowOwnershipFiltering: z.boolean().optional(),
    noClickthroughMessageContent: z.string().optional(),
  })
  .and(chartTypes)
  .and(filterSchema)
  .and(titleSchema)
  .superRefine((data, ctx) => {
    if (data.dataSource !== 'risk' && data.chartType === 'placemat') {
      ctx.addIssue({
        message: 'Placemat is only available for risks',
        code: z.ZodIssueCode.custom,
      });
    }
  });

export type SettingsSchema = z.infer<typeof settingsSchema>;
