import { useLazyQuery } from '@apollo/client';
import type {
  PropertyFilterOption,
  PropertyFilterQuery,
} from '@cloudscape-design/collection-hooks';
import type { NonCancelableCustomEvent } from '@risk-smart/themed-cloudscape-components/interfaces';
import type { PropertyFilterProps } from '@risk-smart/themed-cloudscape-components/property-filter';
import { defaultPropertyFilterI18nStrings } from '@risksmart-app/components/src/table/propertyFilterI18nStrings';
import type { DataSourceType } from '@risksmart-app/shared/reporting/schema';
import { GetReportingFilterOptionsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC, useRef, useState } from 'react';
import type { StatusType } from 'src/components/form/controlled-select/SelectUtils';
import PropertyFilterPanel from 'src/components/property-filter-panel';

import { useCustomDatasourceHelpers } from '../useCustomDatasourceHelpers';
import type { FieldDefinitionWithDataSourceIndex } from './customDatasourceModel';
import { displayTypes } from './display-types';
import { getFieldFromUniqueId } from './fieldValue';
import type { RelatedDataSource } from './types';

const limit = 50;

export type Props = {
  query: PropertyFilterQuery;
  onChange: (query: PropertyFilterQuery) => void;
  allFields: FieldDefinitionWithDataSourceIndex[];
  datasources: RelatedDataSource[];
};

const CustomDatasourcePropertyFilter: FC<Props> = ({
  allFields,
  datasources,
  query,
  onChange,
}) => {
  const pageNumber = useRef<number>(0);
  const [filteringOptions, setFilteringOptions] = useState<
    PropertyFilterOption[]
  >([]);
  const request = useRef<
    | {
        filteringProperty: PropertyFilterProps.FilteringProperty | undefined;
        filteringText: string;
      }
    | undefined
  >(undefined);

  const [getFilterOptions] = useLazyQuery(GetReportingFilterOptionsDocument);
  const [status, setStatus] = useState<StatusType>('pending');

  const helpers = useCustomDatasourceHelpers();

  const fetchData = async ({
    filteringText,
    filteringProperty,
    fieldId,
    dataSourceType,
  }: {
    filteringText: string;
    filteringProperty: PropertyFilterProps.FilteringProperty;
    fieldId: string;
    dataSourceType: DataSourceType;
  }) => {
    try {
      const { data } = await getFilterOptions({
        variables: {
          Input: {
            dataSourceType,
            fieldId,
            filteringText,
            limit,
            offset: (pageNumber.current - 1) * limit,
          },
        },
      });
      const items: PropertyFilterOption[] = data?.reportingFilterOptions
        .map(({ value }) => ({
          value,
          label: value,
          propertyKey: filteringProperty.key,
        }))
        .concat([
          { value: 'null', label: 'Blank', propertyKey: filteringProperty.key },
        ]) ?? [
        { value: 'null', label: 'Blank', propertyKey: filteringProperty.key },
      ];

      const hasNext = items.length === limit;
      if (
        !request.current ||
        request.current.filteringText !== filteringText ||
        request.current.filteringProperty !== filteringProperty
      ) {
        // there is another request in progress, discard the result of this one
        return;
      }
      setFilteringOptions(
        pageNumber.current === 1 ? items : filteringOptions.concat(items)
      );
      setStatus(hasNext ? 'pending' : 'finished');
    } catch {
      setStatus('error');
    }
  };

  const handleLoadItems = ({
    detail: { filteringProperty, filteringText, firstPage, samePage },
  }: NonCancelableCustomEvent<PropertyFilterProps.LoadItemsDetail>) => {
    if (firstPage) {
      pageNumber.current = 0;
      setFilteringOptions([]);
    }
    if (!filteringProperty) {
      return;
    }
    const fieldKeys = getFieldFromUniqueId(filteringProperty.key);

    const field = allFields.find((f) => f.fieldId === fieldKeys.fieldId);
    if (!field) {
      return;
    }
    const fieldType = displayTypes[field.displayType];
    if (!fieldType.asyncOptionSuggestions) {
      return;
    }
    const dataSourceType = datasources[field.dataSourceIndex]?.type;

    if (!dataSourceType) {
      throw new Error('Data source not found');
    }

    setStatus('loading');
    if (!samePage) {
      pageNumber.current++;
    }
    request.current = {
      filteringProperty,
      filteringText,
    };

    fetchData({
      filteringText,
      filteringProperty,
      fieldId: fieldKeys.fieldId,
      dataSourceType,
    });
  };

  return (
    <PropertyFilterPanel
      filteringStatusType={status}
      onLoadItems={handleLoadItems}
      disableFreeTextFiltering={true}
      virtualScroll={true}
      expandToViewport={true}
      enableTokenGroups={true}
      i18nStrings={defaultPropertyFilterI18nStrings}
      query={query}
      filteringOptions={filteringOptions}
      filteringProperties={
        allFields
          .filter((fieldDef) => {
            return !!displayTypes[fieldDef.displayType].propertyConfig;
          })
          .map((fieldDef) => {
            return displayTypes[fieldDef.displayType].propertyConfig!(
              {
                ...fieldDef,
                key: fieldDef.value,
                propertyLabel: fieldDef.label ?? fieldDef.defaultNestedLabel,
                groupValuesLabel: '',
              },
              helpers,
              // custom data source filtering does not use any of these
              { departmentTypes: [], users: [], tagTypes: [], userGroups: [] }
            );
          }) ?? []
      }
      onChange={(e) => onChange(e.detail)}
    />
  );
};

export default CustomDatasourcePropertyFilter;
