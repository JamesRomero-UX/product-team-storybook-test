import type { FilterGroup } from '@risksmart-app/shared/reporting/api/schema';
import type {
  GetCustomDatasourcesQuery,
  ReportingDataInput,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { RelatedDataSource } from './update/types';

export type CustomDatasourceTableFields = {
  Id: string;
  CreatedByUserName: string | undefined;
  ModifiedByUserName: string | undefined;
  Title: string | undefined;
  ModifiedAtTimestamp: string;
  ModifiedByUser: string;
  CreatedByUser: string;
  CreatedAtTimestamp: string;
};

export type CustomDatasource =
  GetCustomDatasourcesQuery['custom_datasource'][number];

export type TypedCustomDatasource = Omit<
  CustomDatasource,
  'Datasources' | 'Fields' | 'Filters'
> & {
  Filters?: FilterGroup;
  Datasources: RelatedDataSource[];
  Fields?: ReportingDataInput['fields'];
};
