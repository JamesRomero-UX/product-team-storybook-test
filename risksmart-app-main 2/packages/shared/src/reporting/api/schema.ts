import { z } from 'zod';

import { aggregateType, dataSourceTypeSchema, joinType } from '../schema';

export const datasourceRelationshipType = z.enum([
  'parent',
  'child',
  'sibling',
]);

export const datasourceRequestSchema = z.object({
  type: dataSourceTypeSchema,
  joinType: joinType.nullish(),
  /**
   * Index of "left" datasource to join to
   * In the future, we could ideally do with renaming this to leftDatasourceIndex or something
   * unrelated to child/parent which is defined with relationshipType
   */
  parentIndex: z.number().int().nullish(),

  /**
   * How this datasource related to its parentIndex datasource
   * e.g. a risk can be joined to another risk as a parent or a child
   * By default, this will be "child" i.e. this datasource is a child of parentIndex
   */
  relationshipToParentIndex: datasourceRelationshipType.nullish(),

  /**
   * Only return the latest record for each parent
   */
  latest: z.boolean().nullish(),
});

// Add sibling in the future!

export type DatasourceRelationshipType = z.infer<
  typeof datasourceRelationshipType
>;

export const datasourceFieldSchema = z.object({
  fieldId: z.string(),
  dataSourceIndex: z.number().int(),
});

export const operatorSchema = z.enum([
  '=',
  '!=',
  '<',
  '>',
  '<=',
  '>=',
  'contains', // for backwards compatability
  ':',
  '!:',
]);

export type Operator = z.infer<typeof operatorSchema>;

export const groupByDatePrecision = z.enum(['day', 'month', 'year']);

export type GroupByDatePrecision = z.infer<typeof groupByDatePrecision>;

export const filterSchema = z.object({
  field: datasourceFieldSchema,
  value: z.string().or(z.number()).or(z.null()),
  operator: operatorSchema,
});

const filterBaseSchema = z.object({
  operation: z.enum(['and', 'or']),
});

export type FilterGroup = z.infer<typeof filterBaseSchema> & {
  filters: (Filter | FilterGroup)[];
};

export const filterGroupSchema: z.ZodType<FilterGroup> =
  filterBaseSchema.extend({
    filters: z.lazy(() => z.array(filterGroupSchema.or(filterSchema))),
  });

export type Filter = z.infer<typeof filterSchema>;

export type DataSourceField = z.infer<typeof datasourceFieldSchema>;

export type DataSourceRequest = z.infer<typeof datasourceRequestSchema>;

const groupBySchema = z.object({
  field: datasourceFieldSchema,
  datePrecision: groupByDatePrecision.nullish(),
});

export type GroupBy = z.infer<typeof groupBySchema>;

export const PostSchema = z.object({
  Input: z
    .object({
      dataSources: z.array(datasourceRequestSchema),
      fields: z.array(datasourceFieldSchema),
      filters: filterGroupSchema,
      groupBy: groupBySchema.array().nullish(),
      aggregateType: aggregateType.nullish(),
      aggregateField: datasourceFieldSchema.nullish(),
      limit: z.number(),
      offset: z.number(),
    })
    .superRefine((values, ctx) => {
      if (!values.aggregateType && values.fields.length < 1) {
        ctx.addIssue({
          path: ['fields'],
          code: 'too_small',
          message: 'Required',
          minimum: 1,
          type: 'array',
          inclusive: true,
        });
      }
    }),
});
