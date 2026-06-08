import {
  datasourceRelationshipType,
  operatorSchema,
} from '@risksmart-app/shared/reporting/api/schema';
import {
  dataSourceTypeSchema,
  joinType,
} from '@risksmart-app/shared/reporting/schema';
import { z } from 'zod';

import { getFlattenedDataSources } from './datasourceTreeMapping';
import { selectedFieldSchema } from './field-selection/fieldSelectionSchema';

const dataSourceBaseSchema = z.object({
  fields: z.array(selectedFieldSchema),
  type: dataSourceTypeSchema,
  relationshipToParentIndex: datasourceRelationshipType.nullish(),
  joinType: joinType.nullish(),
  latest: z.boolean().nullish(), // Migrate db data so we don't need to support undefined?
});

export type TreeDataSource = z.infer<typeof dataSourceBaseSchema> & {
  children: TreeDataSource[];
};

export const dataSourceSchema: z.ZodType<TreeDataSource> =
  dataSourceBaseSchema.extend({
    children: z.lazy(() => dataSourceSchema.array()),
  });
const token = z.object({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: z.custom<Required<any>>((x) => x !== undefined),
  propertyKey: z.string(),
  operator: operatorSchema,
});
export type Token = z.infer<typeof token>;

const operationEnum = z.enum(['and', 'or']);

export type Operation = z.infer<typeof operationEnum>;

const tokenGroup = z.object({
  operation: operationEnum,
  tokens: z.array(token),
});
export type TokenGroup = z.infer<typeof tokenGroup>;

const filters = z.object({
  operation: operationEnum,
  tokens: z.array(z.any()).max(0), // Don't use this
  tokenGroups: z.array(token.or(tokenGroup)).optional(),
});
export type Filters = z.infer<typeof filters>;

export const customDatasourceFormSchema = z
  .object({
    dataSource: dataSourceSchema,
    title: z.string().min(1, 'Required'),

    filters,
  })
  .superRefine((values, ctx) => {
    const fields = getFlattenedDataSources(values.dataSource).flatMap(
      (ds) => ds.fields
    );

    if (fields.length === 0) {
      ctx.addIssue({
        message: 'At least 1 field must be selected',
        code: z.ZodIssueCode.custom,
        path: ['dataSource'],
      });
    }
  });

export type CustomDatasourceFormData = z.infer<
  typeof customDatasourceFormSchema
>;

export const defaultValues: CustomDatasourceFormData = {
  title: '',
  dataSource: {
    type: null as unknown as 'risks',
    children: [],
    joinType: null,
    fields: [],
  },
  filters: {
    operation: 'and',
    tokens: [],
    tokenGroups: [],
  },
};
