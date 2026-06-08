import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useTranslation } from 'react-i18next';
import { MAX_COL_WIDTH } from 'src/App.config';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import Link from '@/components/link';
import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import { exportStyleFromValue } from '@/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { impactDetailsUrl } from '@/utils/urls';

import { getPerformanceRatingFromPerformanceScore } from './ratings/performanceCalculation';
import type { Impact, ImpactTableFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<ImpactTableFields> => {
  const allOwners = useGetOwnersFieldConfig<ImpactTableFields>({
    formId: 'impact',
    fieldId: 'Owners',
  });
  const { t: stc } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'impacts.columns',
  });
  const { getByValue: getImpactPerformanceByValue } =
    useRating('impact_performance');

  return {
    SequentialIdLabel: { header: stc('id'), sortingField: 'SequentialId' },
    Name: {
      formId: 'impact',
      fieldId: 'Name',
      cell: (item) => (
        <Link variant={'secondary'} href={impactDetailsUrl(item.Id)}>
          {item.Name}
        </Link>
      ),
      maxWidth: MAX_COL_WIDTH,
      isRowHeader: true,
    },

    Rationale: {
      formId: 'impact',
      fieldId: 'Rationale',
      cell: (item) => item.Rationale ?? '-',
      maxWidth: MAX_COL_WIDTH,
    },
    allOwners,
    PerformanceScore: {
      header: st('PerformanceScore'),
      cell: (item) => {
        const rating = getImpactPerformanceByValue(
          getPerformanceRatingFromPerformanceScore(item.PerformanceScore)
        );

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
      // PDF export: style cell using the performance rating colour
      exportCellStyle: exportStyleFromValue(
        (item) =>
          getPerformanceRatingFromPerformanceScore(item.PerformanceScore),
        (rating) => getImpactPerformanceByValue(rating)
      ),
    },
    RatedItems: {
      header: st('RatedItems'),
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
  };
};

export const useGetCollectionTableProps = (
  records: Impact[] | undefined
): TablePropsWithActions<ImpactTableFields> => {
  const { t: st } = useTranslation(['common'], { keyPrefix: 'impacts' });
  const fields = useGetFieldConfig();

  const labelledFields = useLabelledFields(records);

  return useGetTableProps({
    tableId: 'impactRegister',
    data: labelledFields,
    customAttributeFormIds: ['impact'],
    entityLabel: st('entity_name'),
    emptyCollectionAction: <></>,
    preferencesStorageKey: 'ImpactRegisterTable-Preferences',
    enableFiltering: true,
    initialColumns: ['Name', 'Rationale', 'allOwners', 'RatedItems'],
    fields,
  });
};
