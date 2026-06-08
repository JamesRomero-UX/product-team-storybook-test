import type { DepartmentPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';

export const getDepartmentsValue = (item: {
  departments: DepartmentPartsFragment[];
}) =>
  item.departments.length > 0
    ? item.departments.map((t) => t.type?.Name).join(', ')
    : '-';
