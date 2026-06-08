import type {
  DataSourceField,
  DataSourceRequest,
  FilterGroup,
  GroupBy,
} from '@risksmart-app/shared/reporting/api/schema';
import type { AggregateType } from '@risksmart-app/shared/reporting/schema';
import type { CustomAttributeSchema, ParentTypeEnum } from 'generated/graphql';
import type { SelectQueryBuilder } from 'kysely';

export type CustomAttributeSchemaLookup = {
  [parentType in ParentTypeEnum]?: CustomAttributeSchema['Schema'];
};

// Turning off type safety, as not that useful for dynamic stuff. May introduce back in later
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryBuilder = SelectQueryBuilder<any, any, any>;

export interface QueryOptions {
  /**
   * For columns such a tags/departments/owners which are returned as an array of strings within a column,
   * this flag will return each tag/department/owner on a separate row
   */
  unnestInlineArrays?: boolean;
  fields?: DataSourceField[] | null;
  filters?: FilterGroup;
  dataSources: DataSourceRequest[];
  /**
   * The number of records to skip before returning data
   */
  offset?: number | null;
  /***
   * The maximum number of results to return
   */
  limit?: number | null;

  /**
   * The field to group on
   */
  groupBy?: GroupBy[] | null;

  /**
   * how to aggregate the data when using group by
   */
  aggregateType?: AggregateType | null;

  /**
   * If aggregating with min, max, avg or sum, then specified the aggregate field
   */
  aggregateField?: DataSourceField | null;

  /**
   * A lookup of custom attribute schemas. Required for validation when querying custom attributes
   */
  customAttributeSchemaLookup: CustomAttributeSchemaLookup;
  /**
   * Retrieve only unique rows
   */
  distinct?: boolean | null;
}
