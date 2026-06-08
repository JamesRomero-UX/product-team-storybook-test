import { useQuery } from '@apollo/client';
import type {
  PropertyFilterOperator,
  PropertyFilterProperty,
} from '@cloudscape-design/collection-hooks';
import type { DepartmentPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDepartmentsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BadgeList from 'src/components/badge-list';
import { useDeepCompareMemoize } from 'use-deep-compare-effect';
import { z } from 'zod';

import type { FieldConfig, Header } from '../types';

export function useGetDepartmentFieldConfig<
  T extends {
    Id: string;
  },
>(
  getDepartments: (record: T) => DepartmentPartsFragment[],
  header?: Header
): FieldConfig<T> {
  const { data: departments } = useQuery(GetDepartmentsDocument);

  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const headerConfig = useDeepCompareMemoize(header);

  return useMemo(
    () => ({
      ...(headerConfig ?? { header: t('departments') }),
      cell: (item) => (
        <BadgeList
          badges={getDepartments(item)
            ?.map((department) => department.type?.Name)
            .filter((e) => e != null)}
        />
      ),
      filterOptions: {
        filteringProperties: createDepartmentsFieldPropertyFilter(
          departments?.department_type || [],
          t('blank')
        ),
        filteringOptions: [
          ...(departments?.department_type?.map((t) => ({
            value: t.DepartmentTypeId,
            label: t.Name,
          })) ?? []),
          { value: 'null', label: t('blank') },
        ],
      },
      sortingComparator: (a, b) => {
        const deptA =
          getDepartments(a)
            ?.map((department) => department.type?.Name || '')
            .filter((name) => name !== '')
            .sort()
            .join(', ')
            .toLowerCase() || '';
        const deptB =
          getDepartments(b)
            ?.map((department) => department.type?.Name || '')
            .filter((name) => name !== '')
            .sort()
            .join(', ')
            .toLowerCase() || '';

        return deptA.localeCompare(deptB);
      },
      exportVal: (item) =>
        getDepartments(item)
          .map((department) => department.type?.Name || '')
          .join(','),
    }),
    [departments?.department_type, getDepartments, t, headerConfig]
  );
}

export const createDepartmentsFieldPropertyFilter = (
  departments: { Name: string | undefined; DepartmentTypeId: string }[],
  blankLabel: string
): Partial<PropertyFilterProperty> => {
  const getDepartmentById = (departmentTypeId: string) =>
    departmentTypeId === 'null'
      ? blankLabel
      : departments.find((t) => t.DepartmentTypeId === departmentTypeId)
          ?.Name || '-';
  const hasDepartment = (departments: unknown, departmentTypeId: string) => {
    const deptList = (departments || []) as {
      Name: string;
      DepartmentTypeId: string;
    }[];
    if (departmentTypeId === 'null') {
      return deptList.length === 0;
    }

    return !!deptList.find((t) => t.DepartmentTypeId === departmentTypeId);
  };

  const doesNotHaveDepartment = (
    departments: unknown,
    departmentTypeId: string
  ) => !hasDepartment(departments, departmentTypeId);

  return {
    operators: [
      ...(['=', ':'] as PropertyFilterOperator[]).map((operator) => ({
        operator,
        format: getDepartmentById,
        match: hasDepartment,
      })),
      ...(['!=', '!:'] as PropertyFilterOperator[]).map((operator) => ({
        operator,
        format: getDepartmentById,
        match: doesNotHaveDepartment,
      })),
      {
        operator: '<',
        format: (num: string): string => {
          const parsed = z.coerce.number().default(0).safeParse(num);
          if (parsed.success) {
            return parsed.data.toString();
          }

          return '';
        },
        match: (departments: unknown, num: string) => {
          const parsed = z.coerce.number().default(0).safeParse(num);
          if (parsed.success) {
            return ((departments || []) as unknown[]).length < parsed.data;
          }

          return false;
        },
      },
    ],
  };
};
