import type { BreachedIssuesPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { FieldConfig } from '../types';

export function useGetIssuesFieldConfig<
  T extends {
    Id: string;
    BreachedIssues: BreachedIssuesPartsFragment[];
  },
>(): FieldConfig<T> {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'obligations',
  });

  return useMemo(
    () => ({
      header: t('columns.Breaches'),
      cell: (item) => item.BreachedIssues.length,
      exportVal: (item) =>
        item.BreachedIssues?.map((issue) => issue.issue?.Title || '').join(','),
    }),
    [t]
  );
}
