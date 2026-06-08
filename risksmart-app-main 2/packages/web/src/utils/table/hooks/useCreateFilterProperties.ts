import type { PropertyFilterOperator } from '@cloudscape-design/collection-hooks';
import type { PropertyFilterProps } from '@risk-smart/themed-cloudscape-components/property-filter';
import type { FormConfigurationPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import useEntityInfo from 'src/hooks/getEntityInfo';

import type { TableRecord } from '../types';
import { useFormConfigRegistry } from './form/useFormConfigRegistry';
import { getColumnHeader } from './getColumnHeader';
import type { TableFieldsWithCustomAttributes } from './useAddCustomAttributeFieldData';

const DEFAULT_OPERATORS: readonly PropertyFilterOperator[] = [
  ':',
  '!:',
  '=',
  '!=',
] as const;

export const useCreateFilterProperties = <T extends TableRecord>(
  tableFields: TableFieldsWithCustomAttributes<T>,
  formConfigurations: FormConfigurationPartsFragment[] | null
) => {
  const formRegistry = useFormConfigRegistry();
  const getEntityInfo = useEntityInfo();

  return useMemo((): PropertyFilterProps.FilteringProperty[] => {
    return Object.entries(tableFields).map(([fieldName, fieldConfig]) => {
      const { filteringProperties } = fieldConfig.filterOptions ?? {};
      const header = getColumnHeader(
        { formConfigurations, formRegistry, getEntityInfo },
        fieldConfig
      );

      return {
        key: fieldName,
        groupValuesLabel: filteringProperties?.defaultOperator ?? header,
        propertyLabel: header,
        operators: filteringProperties?.operators ?? DEFAULT_OPERATORS,
        ...filteringProperties,
      };
    });
  }, [tableFields, formConfigurations, formRegistry, getEntityInfo]);
};
