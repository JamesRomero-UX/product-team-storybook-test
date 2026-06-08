import type {
  Filter,
  FilterGroup,
} from '@risksmart-app/shared/reporting/api/schema';
import type {
  CustomDatasourceField,
  DataSource,
  ReportingDataInput,
  SelectedDatasourceField,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { notEmpty } from 'src/utilityTypes';

import type { TypedCustomDatasource } from '../types';
import type {
  CustomDatasourceFormData,
  Filters,
  Token,
} from './customDatasourceSchema';
import {
  getFlattenedDataSources,
  getTreeDataSources,
} from './datasourceTreeMapping';
import { getFieldFromUniqueId, getFieldUniqueId } from './fieldValue';

const tokenToPropertyFilter = (t: Token) => {
  const field = getFieldFromUniqueId(t.propertyKey);

  return {
    value: t.value as unknown as string,
    operator: t.operator,
    field,
  };
};

export type CustomDataSource = {
  Title: string;
  Datasources: Array<DataSource>;
  Fields: Array<CustomDatasourceField>;
  Filters: FilterGroup;
};

export const mapServerDataToFormData = (
  savedCustomDatasource: TypedCustomDatasource
): CustomDatasourceFormData => {
  const formData: CustomDatasourceFormData = {
    title: savedCustomDatasource.Title,
    dataSource: getTreeDataSources(savedCustomDatasource),
    filters: {
      operation: savedCustomDatasource.Filters?.operation ?? 'and',
      tokens: [],
      tokenGroups: savedCustomDatasource.Filters?.filters.map((fg) => {
        if ('filters' in fg) {
          return {
            operation: fg.operation,
            tokens: fg.filters
              .map((f) => {
                if ('filters' in f) {
                  // UI does not support nested groups yet
                  return null;
                }

                return mapFilterToToken(f);
              })
              .filter(notEmpty),
          };
        }

        return mapFilterToToken(fg);
      }),
    },
  };

  return formData;
};

const mapFilterToToken = (filter: Filter) => {
  const token: Token = {
    operator: filter.operator,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: filter.value as any,
    propertyKey: getFieldUniqueId(filter.field),
  };

  return token;
};

export const mapFromDataToServerVariables = (
  formData: CustomDatasourceFormData,
  paging: { offset: number; limit: number },
  fieldValueOrder: string[] | undefined
): ReportingDataInput => {
  // TODO: move flatting to be part of TreeDatasource (possible with option to choose format)
  const dataSources = getFlattenedDataSources(formData.dataSource);
  let fields: SelectedDatasourceField[];
  const selectedFields = dataSources.flatMap((d, dataSourceIndex) =>
    d.fields.map((f) => ({
      ...f,
      dataSourceIndex,
      value: getFieldUniqueId({ dataSourceIndex, fieldId: f.fieldId }),
    }))
  );
  if (fieldValueOrder) {
    fields = fieldValueOrder
      .map((v) => selectedFields.find((f) => f.value == v))
      .filter(notEmpty);
  } else {
    fields = selectedFields;
  }

  return {
    offset: paging.offset,
    limit: paging.limit,
    dataSources: dataSources.map((d) => ({
      type: d.type,
      joinType: d.joinType,
      parentIndex: d.parentIndex,
      relationshipToParentIndex: d.relationshipToParentIndex,
      latest: d.latest,
    })),
    fields: fields.map((f) => ({
      fieldId: f.fieldId,
      dataSourceIndex: f.dataSourceIndex,
      label: f.label,
    })),

    filters: mapQueryToFilterGroup(formData.filters),
  };
};

// TODO: move mapping to PropertyFilter component?
export const mapQueryToFilterGroup = (filters: Filters): FilterGroup => {
  return {
    operation: filters.operation,
    filters:
      filters.tokenGroups?.map((tg) => {
        if ('tokens' in tg) {
          const filterGroup: FilterGroup = {
            operation: tg.operation,
            filters: tg.tokens.map((t) => tokenToPropertyFilter(t)),
          };

          return filterGroup;
        } else {
          return tokenToPropertyFilter(tg);
        }
      }) ?? [],
  };
};
