import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_COL_WIDTH } from 'src/App.config';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import Link from '@/components/link';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import { useGetTablePropsWithoutUrlHash } from '@/utils/table/hooks/useGetTablePropsWithoutUrlHash';
import {
  exportStyleFromOption,
  exportStyleFromValue,
} from '@/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

import { ImpactRatingStatus } from './ratingStatus';
import type {
  ImpactAppetites,
  ImpactRating,
  ImpactRatingTableFields,
} from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (
  onEdit: (item: ImpactRatingTableFields) => void
): TableFields<ImpactRatingTableFields> => {
  const { getByValue: getImpactRatingByValue } = useRating('impact');
  const { getByValue: getImpactPerformanceByValue } =
    useRating('impact_performance');
  const { t: stf } = useTranslation(['common'], {
    keyPrefix: 'impactRatings.footerLabels',
  });
  const { t: stc } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'impactRatings.columns',
  });
  const { getByValue: getImpactRatingStatus } = useRating(
    'impact_rating_status'
  );
  const { getByValue: getLikelihood } = useRating('likelihood');

  return {
    SequentialIdLabel: { header: stc('id'), sortingField: 'SequentialId' },
    Name: {
      formId: 'impact',
      fieldId: 'Name',
      includeFromTypePostfix: true,
      cell: (item) => (
        <Link variant={'secondary'} onFollow={() => onEdit(item)}>
          {item.impact.Name}
        </Link>
      ),
      maxWidth: MAX_COL_WIDTH,
      isRowHeader: true,
    },
    RatedItem: {
      header: st('RatedItem'),
    },
    TestDate: dateColumnFromConfig({
      header: { header: st('TestDate') },
      dateField: 'TestDate',
    }),
    Status: {
      header: st('Status'),
      cell: (item) => (
        <SimpleRatingBadge rating={getImpactRatingStatus(item.Status)} />
      ),
      sortingField: 'Status',
      maxWidth: MAX_COL_WIDTH,
      exportCellStyle: exportStyleFromOption((item) =>
        getImpactRatingStatus(item.Status)
      ),
    },
    RatingScore: {
      header: st('RatingScore'),
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
      footerLabel: stf('RatingScore'),
      footerVal: (records) =>
        records
          .filter((r) => r.Status === ImpactRatingStatus.Active)
          .reduce(
            (previous, currentValue) => previous + currentValue.RatingScore,
            0
          ),
      exportVal: (item) => item.Rating,
      exportCellStyle: exportStyleFromValue(
        (item) => item.Rating,
        (rating) => getImpactRatingByValue(rating)
      ),
    },
    PerformanceScore: {
      header: st('PerformanceScore'),
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
      footerLabel: stf('PerformanceScore'),
      footerVal: (records) =>
        records
          .filter((r) => r.Status === ImpactRatingStatus.Active)
          .reduce(
            (previous, currentValue) =>
              previous + (currentValue.PerformanceScore ?? 0),
            0
          ),
      exportCellStyle: exportStyleFromValue(
        (item) => item.Performance,
        (rating) => getImpactPerformanceByValue(rating)
      ),
    },
    CreatedAtTimestamp: dateColumnFromConfig({
      header: { header: stc('created_on') },
      dateField: 'CreatedAtTimestamp',
    }),
    Id: {
      header: stc('guid'),
    },
    ModifiedAtTimestamp: dateColumnFromConfig({
      header: { header: stc('updated_on') },
      dateField: 'ModifiedAtTimestamp',
    }),
    CreatedByUser: {
      header: stc('created_by_id'),
    },
    CreatedByUserName: {
      header: stc('created_by_username'),
    },
    CompletedByUserName: {
      formId: 'impact_rating',
      fieldId: 'CompletedBy',
    },
    LikelihoodLabel: {
      formId: 'impact_rating',
      fieldId: 'Likelihood',
      cell: (item) => (
        <SimpleRatingBadge rating={getLikelihood(item.Likelihood)} />
      ),
      exportCellStyle: exportStyleFromOption((item) =>
        getLikelihood(item.Likelihood)
      ),
    },
  };
};

const useGetImpactRatingTableProps = (
  records: ImpactRating[] | undefined,
  impactAppetites: ImpactAppetites | undefined,
  onEdit: (item: ImpactRatingTableFields) => void
): UseGetTablePropsOptions<ImpactRatingTableFields> => {
  const { t: st } = useTranslation(['common'], { keyPrefix: 'impactRatings' });
  const fields = useGetFieldConfig(onEdit);
  const labelledFields = useLabelledFields(records, impactAppetites);

  return useMemo(
    () => ({
      tableId: 'impactRatingRegister',
      data: labelledFields,
      customAttributeFormIds: ['impact_rating'],
      entityLabel: st('entity_name'),
      emptyCollectionAction: <></>,
      preferencesStorageKey: 'ImpactRatingRegisterTable-Preferences',
      enableFiltering: true,
      initialColumns: [
        'Name',
        'RatedItem',
        'CompletedByUserName',
        'TestDate',
        'Status',
        'PerformanceScore',
        'RatingScore',
      ],
      fields,
    }),
    [fields, labelledFields, st]
  );
};

export const useGetCollectionStatelessTableProps = (
  records: ImpactRating[] | undefined,
  impactAppetites: ImpactAppetites | undefined,
  onEdit: (item: ImpactRatingTableFields) => void
): TablePropsWithActions<ImpactRatingTableFields> => {
  const tableProps = useGetImpactRatingTableProps(
    records,
    impactAppetites,
    onEdit
  );

  return useGetTablePropsWithoutUrlHash(tableProps);
};

export const useGetCollectionTableProps = (
  records: ImpactRating[] | undefined,
  impactAppetites: ImpactAppetites | undefined,
  onEdit: (item: ImpactRatingTableFields) => void
): TablePropsWithActions<ImpactRatingTableFields> => {
  const tableProps = useGetImpactRatingTableProps(
    records,
    impactAppetites,
    onEdit
  );

  return useGetTableProps(tableProps);
};
