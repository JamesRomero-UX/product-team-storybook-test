import Link from '@risksmart-app/components/src/link';
import _ from 'lodash';
import { useMemo } from 'react';
import { notEmpty } from 'src/utilityTypes';

import type { FieldConfig, TableRecord } from '../types';

export type LinkItem = {
  label: string;
  url?: string;
};

export function useLinkArrayField<T extends TableRecord>(
  header: string,
  getLinks: (r: T) => LinkItem[]
): FieldConfig<T> {
  return useMemo<FieldConfig<T>>(
    () => ({
      header,
      cell: (item) =>
        getLinks(item)
          .map((link, i) => {
            return (
              <div key={i}>
                <Link href={link.url}>{link.label}</Link>
              </div>
            );
          })
          .filter(notEmpty),
      filterOptions: {
        filteringOptions: (records) =>
          _.uniq(records.flatMap((r) => getLinks(r)).map((r) => r.label)).map(
            (label) => ({ label, value: label })
          ),
        filteringProperties: {
          operators: [
            {
              operator: '=',
              match: (
                links: unknown,
                tokenValue: string | null | undefined
              ) => {
                return !!((links || []) as LinkItem[]).find(
                  (t) => t.label === tokenValue
                );
              },
            },
            {
              operator: '!=',
              match: (
                links: unknown,
                tokenValue: string | null | undefined
              ) => {
                return !((links || []) as LinkItem[]).find(
                  (t) => t.label === tokenValue
                );
              },
            },
            {
              operator: ':',
              match: (
                links: unknown,
                tokenValue: string | null | undefined
              ) => {
                return !!((links || []) as LinkItem[]).find((t) =>
                  t.label
                    .toLowerCase()
                    .includes((tokenValue || '').toLowerCase())
                );
              },
            },
            {
              operator: '!:',
              match: (
                links: unknown,
                tokenValue: string | null | undefined
              ) => {
                return !((links || []) as LinkItem[]).find((t) =>
                  t.label
                    .toLowerCase()
                    .includes((tokenValue || '').toLowerCase())
                );
              },
            },
          ],
        },
      },
      sortingComparator(a, b) {
        const aLabel: string | undefined = getLinks(a)[0]?.label;
        const bLabel: string | undefined = getLinks(b)[0]?.label;
        if (!aLabel) {
          return -1;
        }
        if (!bLabel) {
          return 1;
        }

        return aLabel?.localeCompare(bLabel);
      },
      exportVal: (item) =>
        getLinks(item)
          .map((a) => a.label)
          .join(','),
    }),
    [getLinks, header]
  );
}
