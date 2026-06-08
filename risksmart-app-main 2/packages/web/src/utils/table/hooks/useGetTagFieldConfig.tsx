import type {
  PropertyFilterOperator,
  PropertyFilterProperty,
} from '@cloudscape-design/collection-hooks';
import type { TagPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BadgeList from 'src/components/badge-list';
import { useDeepCompareMemoize } from 'use-deep-compare-effect';
import { z } from 'zod';

import { useGetTags } from '@/hooks/queries';

import type { FieldConfig, Header } from '../types';

export function useGetTagFieldConfig<
  T extends {
    Id: string;
    tags: TagPartsFragment[];
  },
>(header?: Header): FieldConfig<T> {
  const { data: tags } = useGetTags({ queryArgs: {} });
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const headerConfig = useDeepCompareMemoize(header);

  return useMemo(
    () => ({
      ...(headerConfig ?? { header: t('tags') }),
      cell: (item) => (
        <BadgeList
          badges={item.tags
            .map((tag) => tag.type?.Name)
            .filter((e) => e != null)}
        />
      ),
      filterOptions: {
        filteringProperties: createTagFieldPropertyFilter(
          tags?.tag_type || [],
          t('blank')
        ),
        filteringOptions: [
          ...(tags?.tag_type?.map((t) => ({
            value: t.TagTypeId,
            label: t.Name,
          })) ?? []),
          { value: 'null', label: t('blank') },
        ],
      },
      sortingComparator: (a, b) => {
        const tagsA =
          a.tags
            ?.map((tag) => tag.type?.Name || '')
            .filter((name) => name !== '')
            .sort()
            .join(', ')
            .toLowerCase() || '';

        const tagsB =
          b.tags
            ?.map((tag) => tag.type?.Name || '')
            .filter((name) => name !== '')
            .sort()
            .join(', ')
            .toLowerCase() || '';

        return tagsA.localeCompare(tagsB);
      },
      exportVal: (item) =>
        item.tags.map((tag) => tag.type?.Name || '').join(','),
    }),
    [t, tags?.tag_type, headerConfig]
  );
}

const createTagFieldPropertyFilter = (
  tags: { Name: string | undefined; TagTypeId: string }[],
  blankLabel: string
): Partial<PropertyFilterProperty> => {
  const getTagById = (tagTypeId: string) =>
    tagTypeId === 'null'
      ? blankLabel
      : tags.find((t) => t.TagTypeId === tagTypeId)?.Name || '-';
  const hasTag = (tags: unknown, tagTypeId: string) => {
    const tagList = (tags || []) as { Name: string; TagTypeId: string }[];
    if (tagTypeId === 'null') {
      return tagList.length === 0;
    }

    return !!tagList.find((t) => t.TagTypeId === tagTypeId);
  };

  const doesNotHaveTag = (tags: unknown, tagTypeId: string) =>
    !hasTag(tags, tagTypeId);

  return {
    operators: [
      ...(['=', ':'] as PropertyFilterOperator[]).map((operator) => ({
        operator,
        format: getTagById,
        match: hasTag,
      })),
      ...(['!=', '!:'] as PropertyFilterOperator[]).map((operator) => ({
        operator,
        format: getTagById,
        match: doesNotHaveTag,
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
        match: (tags: unknown, num: string) => {
          const parsed = z.coerce.number().default(0).safeParse(num);
          if (parsed.success) {
            return ((tags || []) as unknown[]).length < parsed.data;
          }

          return false;
        },
      },
    ],
  };
};
