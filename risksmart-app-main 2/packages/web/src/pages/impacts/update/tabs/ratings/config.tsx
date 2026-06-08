import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type {
  GetAppetitesGroupedByImpactQuery,
  GetImpactRatingsByImpactIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { ImpactRatingStatus } from 'src/pages/impacts/ratings/ratingStatus';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import { toLocalDate } from '@/utils/dateUtils';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';

import type { ImpactRatingTableFields } from './types';
import { useLabelledFields } from './useLabelledFields';

export function useGetFieldConfig(
  onEdit?: (impact: ImpactRatingTableFields) => void
): TableFields<ImpactRatingTableFields> {
  const { getByValue: getImpactRatingStatus } = useRating(
    'impact_rating_status'
  );
  const { t } = useTranslation(['common'], {
    keyPrefix: 'impactRatings.columns',
  });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'impactRatings',
  });
  const { getByValue: getImpactRatingByValue } = useRating('impact');
  const { getByValue: getImpactPerformanceByValue } =
    useRating('impact_performance');
  const { getByValue: getLikelihoodByValue } = useRating('likelihood');

  return {
    ratedItem: {
      header: t('RatedItem'),
      cell: (item) => (
        <Link variant={'secondary'} href={'#'} onFollow={() => onEdit?.(item)}>
          {item.ratedItem.risk?.Title}
        </Link>
      ),
      isRowHeader: true,
    },
    Type: {
      header: t('Type'),
      cell: (item) => item.Type,
      sortingField: 'Type',
    },
    TestDate: {
      formId: 'impact_rating',
      fieldId: 'TestDate',
      cell: (item) => toLocalDate(item.TestDate),
      sortingField: 'TestDate',
    },
    LikelihoodLabel: {
      formId: 'impact_rating',
      fieldId: 'Likelihood',
      cell: (item) => (
        <SimpleRatingBadge rating={getLikelihoodByValue(item.Likelihood)} />
      ),
      sortingField: 'LikelihoodLabel',
    },
    Status: {
      header: t('Status'),
      cell: (item) => (
        <SimpleRatingBadge rating={getImpactRatingStatus(item.Status)} />
      ),
      sortingField: 'Status',
    },
    Rating: {
      header: t('RatingScore'),
      cell: (item) => {
        const rating = getImpactRatingByValue(item.Rating);

        return (
          <SimpleRatingBadge
            rating={{
              ...rating,
              label: item.Rating.toString(),
              tooltip: rating?.label,
            }}
          />
        );
      },
      footerVal: (records) => {
        return records.reduce(
          (previous, currentValue) =>
            previous +
            (currentValue.Status === ImpactRatingStatus.Active
              ? currentValue.Rating
              : 0),
          0
        );
      },
      footerLabel: st('footerLabels.RatingScore'),
      sortingField: 'Rating',
    },
    PerformanceScore: {
      header: t('PerformanceScore'),
      cell: (item) => {
        const rating = getImpactPerformanceByValue(item.Performance);

        return (
          <SimpleRatingBadge
            rating={{
              ...rating,
              label: item.PerformanceScore?.toString() ?? '',
              tooltip: rating?.label,
            }}
          />
        );
      },
      footerVal: (records) => {
        return records.reduce(
          (previous, currentValue) =>
            previous +
            (currentValue.Status === ImpactRatingStatus.Active
              ? (currentValue.PerformanceScore ?? 0)
              : 0),
          0
        );
      },
      sortingField: 'PerformanceScore',
    },
  };
}

export const useGetCollectionTableProps = (
  data: GetImpactRatingsByImpactIdQuery['impact_rating'] | undefined,
  impactAppetites: GetAppetitesGroupedByImpactQuery['impact'] | undefined,
  onEdit: (impact: ImpactRatingTableFields) => void,
  onCreate: () => void
): TablePropsWithActions<ImpactRatingTableFields> => {
  const { t: st } = useTranslation(['common'], { keyPrefix: 'impactRatings' });
  const fields = useGetFieldConfig(onEdit);

  const labelledFields = useLabelledFields(data, impactAppetites);

  return useGetTableProps({
    customAttributeFormIds: [],
    data: labelledFields,
    entityLabel: st('entity_name'),
    emptyCollectionAction: (
      <Permission permission={'insert:impact_rating'}>
        <Button formAction={'none'} onClick={onCreate}>
          {st('create_new_button')}
        </Button>
      </Permission>
    ),
    preferencesStorageKey: 'ImpactRatingsTable-Preferences',
    enableFiltering: false,
    initialColumns: [
      'ratedItem',
      'Type',
      'TestDate',
      'LikelihoodLabel',
      'Status',
      'Rating',
      'PerformanceScore',
    ],
    fields,
  });
};
