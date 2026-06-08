import i18n from '@risksmart-app/i18n/src/i18n';
import type { QUnitType } from 'dayjs';
import dayjs from 'dayjs';
import { isDate } from 'lodash';

import type { TableRecord } from '@/utils/table/types';

import type { Category, CategoryType } from '../gigawidget/types';
import { UNRATED } from '../gigawidget/types';
import type {
  DepartmentFields,
  TagFields,
} from '../gigawidget/util/categoryGetters';
import {
  departmentGetter,
  tagGetter,
} from '../gigawidget/util/categoryGetters';
import type { DashboardFilter } from '../useDashboardStore';

type DefaultClickthroughFilterOptions<K extends string> = {
  categoryValue?: 'key' | 'label';
  unratedValue?: K;
};

export const defaultClickthroughFilter =
  <T extends string, K extends string>(
    propertyKey: T,
    options?: DefaultClickthroughFilterOptions<K>
  ) =>
  (category: Category<TableRecord, CategoryType>) => {
    return [
      {
        propertyKey,
        operator: '=',
        value: category[options?.categoryValue ?? 'label'],
      } as const,
    ];
  };

export const defaultClickthroughFilterWithUnrated =
  <T extends string, K extends string>(
    propertyKey: T,
    options?: DefaultClickthroughFilterOptions<K>
  ) =>
  (category: Category<TableRecord, CategoryType>) => {
    return category.key === UNRATED
      ? [
          {
            propertyKey,
            operator: '=' as const,
            value: options?.unratedValue ?? '-',
          },
        ]
      : [
          {
            propertyKey,
            operator: '=',
            value: category[options?.categoryValue ?? 'label'],
          } as const,
        ];
  };

export const dateRangeClickthroughFilter =
  <T extends string>(propertyKey: T) =>
  (category: Category<TableRecord, CategoryType>, precision: QUnitType) => {
    if (!isDate(category.key)) {
      return [];
    }

    return [
      {
        propertyKey,
        operator: '=',
        value: {
          type: 'absolute',
          startDate: category.key.toISOString(),
          endDate: dayjs(category.key).endOf(precision).toISOString(),
        },
      },
    ];
  };

export const dashboardDateRangeClickthroughFilter =
  <T extends string>(propertyKey: T) =>
  (dateRange: DashboardFilter['dateRange']) => {
    if (!dateRange) {
      return [];
    }

    if (dateRange.type === 'absolute') {
      return [
        {
          propertyKey,
          operator: '=',
          value: {
            type: 'absolute',
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          },
        },
      ];
    }

    if (dateRange.type === 'relative') {
      return [
        {
          propertyKey,
          operator: '=',
          value: {
            type: 'relative',
            key: dateRange.key,
            amount: dateRange.amount,
            unit: dateRange.unit,
          },
        },
      ];
    }

    return [];
  };

export const tagAndDepartmentCategoryGetters = <
  T extends { departments: DepartmentFields[]; tags: TagFields[] },
>() =>
  [
    {
      id: 'departments',
      name: () => i18n.format(i18n.t('department_other'), 'capitalize'),
      categoryGetter: (item: T) =>
        departmentGetter({ includeNoDepartments: true })(item),
      clickthroughFilter: (category: Category<TableRecord, CategoryType>) => [
        {
          propertyKey: 'departments',
          operator: category.key === UNRATED ? '<' : '=',
          value: category.key === UNRATED ? 1 : category.key,
        } as const,
      ],
    },
    {
      id: 'tags',
      name: () => i18n.format(i18n.t('tag_other'), 'capitalize'),
      categoryGetter: (item: T) => tagGetter({ includeNoTags: true })(item),
      clickthroughFilter: (category: Category<TableRecord, CategoryType>) => [
        {
          propertyKey: 'tags',
          operator: category.key === UNRATED ? '<' : '=',
          value: category.key === UNRATED ? 1 : category.key,
        } as const,
      ],
    },
  ] as const;
