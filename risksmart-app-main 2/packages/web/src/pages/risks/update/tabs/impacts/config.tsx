import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type {
  GetActiveAppetitesByParentIdQuery,
  GetImpactRatingsByRatedItemIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_COL_WIDTH } from 'src/App.config';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import { toLocalDate } from '@/utils/dateUtils';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';

import type { ImpactRatingTableFields } from './types';
import { useLabelledFields } from './useLabelledFields';

export const useGetFieldConfig = ({
  onEdit,
}: {
  onEdit: (testResult: ImpactRatingTableFields) => void;
}): TableFields<ImpactRatingTableFields> => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'impactRatings.columns',
  });
  const { getByValue: getRatingByValue } = useRating('impact');
  const { getByValue: getImpactPerformanceByValue } =
    useRating('impact_performance');
  const { getByValue: getImpactRatingStatus } = useRating(
    'impact_rating_status'
  );
  const { getByValue: getImpactPerformanceRating } = useRating(
    'impact_performance_rating'
  );

  const { getByValue: getImpactPlacematByValue } = useRating('impact_placemat');

  return useMemo(
    () => ({
      Name: {
        header: st('Name'),
        cell: (item) => (
          <Link variant={'secondary'} onFollow={() => onEdit(item)} href={`#`}>
            {item.impact.Name}
          </Link>
        ),
        sortingField: 'Name',
        isRowHeader: true,
      },
      Rationale: {
        header: st('Rationale'),
        cell: (item) => item.Rationale,
        sortingField: 'Rationale',
        maxWidth: MAX_COL_WIDTH,
      },
      TestDate: {
        header: st('TestDate'),
        cell: (item) => (item.TestDate ? toLocalDate(item.TestDate) : '-'),
        sortingField: 'TestDate',
      },
      Likelihood: {
        header: st('Likelihood'),
        cell: (item) => {
          const likelihoodMappedToPlacematValue = item.Likelihood
            ? item.Likelihood - 1
            : undefined;

          return (
            <SimpleRatingBadge
              rating={getImpactPlacematByValue(likelihoodMappedToPlacematValue)}
            />
          );
        },
        sortingField: 'Likelihood',
      },
      Status: {
        header: st('Status'),
        cell: (item) => (
          <SimpleRatingBadge rating={getImpactRatingStatus(item.Status)} />
        ),
        sortingField: 'Status',
        maxWidth: MAX_COL_WIDTH,
      },
      Rating: {
        header: st('RatingScore'),
        cell: (item) => {
          const rating = getRatingByValue(item.Rating);

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
        sortingField: 'Rating',
      },
      Performance: {
        header: st('PerformanceScore'),
        cell: (item) => {
          const rating = getImpactPlacematByValue(item.PerformanceScore);

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
        sortingField: 'PerformanceScore',
      },
      PerformanceRatingValue: {
        header: st('PerformanceRating'),
        cell: (item) => {
          const rating = getImpactPerformanceRating(
            item.PerformanceRatingValue
          );

          return <SimpleRatingBadge rating={rating} />;
        },
        sortingField: 'PerformanceScore',
      },
      LikelihoodPerformance: {
        header: st('LikelihoodPerformance'),
        cell: (item) => {
          const rating = getImpactPerformanceByValue(
            item.LikelihoodPerformance
          );

          return <SimpleRatingBadge rating={rating} />;
        },
        sortingField: 'LikelihoodPerformance',
      },

      CompletedByUserName: {
        header: st('CompletedBy'),
        cell: (item) => item.CompletedByUserName,
        sortingField: 'CompletedByUserName',
      },
    }),
    [
      getImpactPerformanceByValue,
      getImpactPerformanceRating,
      getImpactRatingStatus,
      getImpactPlacematByValue,
      getRatingByValue,
      onEdit,
      st,
    ]
  );
};

export const useGetCollectionTableProps = (
  parent: ObjectWithContributors,
  data: GetImpactRatingsByRatedItemIdQuery | undefined,
  appetiteData:
    | GetActiveAppetitesByParentIdQuery['appetite_parent'][number]['appetite'][]
    | undefined,
  onEdit: (testResult: ImpactRatingTableFields) => void,
  handleRatingsOpen: () => void
): TablePropsWithActions<ImpactRatingTableFields> => {
  const { t } = useTranslation(['common']);
  const labelledFields = useLabelledFields(data, appetiteData);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'impactRatings',
  });
  const fields = useGetFieldConfig({ onEdit });

  return useGetTableProps({
    customAttributeFormIds: ['impact_rating'],
    data: labelledFields,
    entityLabel: st('entity_name'),
    enableFiltering: false,
    emptyCollectionAction: (
      <Permission permission={'insert:impact_rating'} parentObject={parent}>
        <Button formAction={'none'} onClick={handleRatingsOpen}>
          {t('impactRatingsMultiple.create_new_button')}
        </Button>
      </Permission>
    ),
    preferencesStorageKey: 'Impact-PreferencesV1',
    initialColumns: [
      'Name',
      'Rationale',
      'TestDate',
      'Likelihood',
      'Status',
      'Rating',
      'Performance',
      'PerformanceRatingValue',
      'LikelihoodPerformance',
      'CompletedByUserName',
    ],
    fields,
  });
};
