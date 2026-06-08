import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';
import type { FilterGroup } from '@risksmart-app/shared/reporting/api/schema';

import type { TypedCustomDatasource } from '../types';
import type { Filters } from '../update/customDatasourceSchema';
import { mapQueryToFilterGroup } from '../update/formDataMapping';

export const combinedFilters = (
  customDatasource: Pick<TypedCustomDatasource, 'Filters'>,
  propertyFilter: PropertyFilterQuery | undefined
) => {
  const filters: FilterGroup['filters'] = [];
  if (customDatasource.Filters && customDatasource.Filters.filters.length > 0) {
    filters.push(customDatasource.Filters);
  }
  if (
    propertyFilter &&
    propertyFilter.tokenGroups &&
    propertyFilter.tokenGroups.length > 0
  ) {
    filters.push(mapQueryToFilterGroup(propertyFilter as Filters));
  }

  if (filters.length === 1) {
    return filters[0];
  }
  const combinedFilters: FilterGroup = {
    operation: 'and',
    filters,
  };

  return combinedFilters;
};
