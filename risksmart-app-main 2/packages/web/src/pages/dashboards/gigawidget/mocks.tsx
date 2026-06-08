import { GetControlsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type PropsWithChildren, useEffect } from 'react';
import type { ControlTableFields } from 'src/pages/controls/types';

import { stub } from '../../../testing/stub';
import { useGetCollectionTableProps as useGetControlTableProps } from '../../controls/config';
import { createDataSource } from '../universal-widget/createDataSource';
import type { DashboardFilter } from '../useDashboardStore';
import { useDashboardStore } from '../useDashboardStore';
import { departmentsFilter, tagsFilter } from './util/filterHelpers';

export const filterWrapper = (filters: DashboardFilter) => {
  const Wrapper = (props: PropsWithChildren) => {
    const { setFilters } = useDashboardStore();

    useEffect(() => {
      setFilters(filters);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return props.children;
  };

  Wrapper.displayName = 'filterWrapper';

  return Wrapper;
};

export const mockDataSource = createDataSource({
  hasAccess: () => true,
  parentTypes: [],
  documentNode: GetControlsDocument,
  trpcQuery: () => {
    // TODO: Implement tRPC query for mock controls
    throw new Error('tRPC query not implemented for mock controls');
  },
  useTablePropsHook: (data) =>
    useGetControlTableProps(() => null, data?.control),
  entityNamePlural: 'control_other',
  entityNameSingular: 'control_one',
  fields: 'controls.fields',
  useDefaultVariables: () => ({ where: {} }),
  dashboardFilterConfig: {
    tagsFilter: (tags) => ({ where: { tags: tagsFilter(tags) } }),
    departmentsFilter: (departments) => ({
      where: { departments: departmentsFilter(departments) },
    }),
  },
  categoryGetters: [],
});

export const mockControlsData = stub<ControlTableFields[]>([
  {
    OverallEffectiveness: 2,
    departments: [
      { type: { Name: 'Department 1' }, DepartmentTypeId: '1', ParentId: '' },
    ],
  },
  {
    OverallEffectiveness: 3,
    departments: [
      { type: { Name: 'Department 1' }, DepartmentTypeId: '1', ParentId: '' },
    ],
  },
  {
    OverallEffectiveness: 2,
    departments: [
      { type: { Name: 'Department 1' }, DepartmentTypeId: '1', ParentId: '' },
    ],
  },
  {
    OverallEffectiveness: 2,
    departments: [
      { type: { Name: 'Department 2' }, DepartmentTypeId: '2', ParentId: '' },
    ],
  },
]);
