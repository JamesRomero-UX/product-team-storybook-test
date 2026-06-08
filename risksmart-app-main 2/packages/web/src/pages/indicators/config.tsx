import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import _ from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_COL_WIDTH } from 'src/App.config';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import Link from '@/components/link';
import { useGetContributorsFieldConfig } from '@/utils/table/hooks/useGetContributorsFieldConfig';
import { useGetDepartmentFieldConfig } from '@/utils/table/hooks/useGetDepartmentFieldConfig';
import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import type { StatefulTableOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetStatelessTableProps } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import { useGetTagFieldConfig } from '@/utils/table/hooks/useGetTagFieldConfig';
import { exportStyleFromValue } from '@/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { indicatorDetailsUrl } from '@/utils/urls';

import { conformanceRatingFromResults } from './calculateConformanceRating';
import {
  latestResultValueFromData,
  previousResultValueFromData,
} from './latestResultValueFromData';
import type { IndicatorFlatFields, IndicatorTableFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<IndicatorTableFields> => {
  const allOwners = useGetOwnersFieldConfig<IndicatorTableFields>({
    formId: 'indicator',
    fieldId: 'Owners',
  });
  const allContributors = useGetContributorsFieldConfig<IndicatorTableFields>({
    formId: 'indicator',
    fieldId: 'Contributors',
  });
  const { getByValue: statusGetByValue } = useRating(
    'indicator_conformance_status'
  );
  const { getByValue: trendGetByValue } = useRating(
    'indicator_conformance_trend'
  );
  const { getByValue: getByValueTestScheduleStatus } = useRating(
    'test_schedule_status'
  );
  const { t: stc } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'indicators.columns',
  });
  const tagField = useGetTagFieldConfig<IndicatorTableFields>({
    formId: 'indicator',
    fieldId: 'tags',
  });
  const departmentField = useGetDepartmentFieldConfig<IndicatorTableFields>(
    (r) => r.departments,
    {
      formId: 'indicator',
      fieldId: 'departments',
    }
  );

  return useMemo(
    () => ({
      SequentialIdLabel: { header: stc('id'), sortingField: 'SequentialId' },
      Title: {
        formId: 'indicator',
        fieldId: 'Title',
        cell: (item) => (
          <Link variant={'secondary'} href={indicatorDetailsUrl(item.Id)}>
            {item.Title}
          </Link>
        ),
        maxWidth: MAX_COL_WIDTH,
        isRowHeader: true,
      },
      ParentTitle: {
        header: st('parent_title'),
        maxWidth: MAX_COL_WIDTH,
      },
      TestFrequencyLabelled: {
        header: st('test_frequency'),
      },
      ConformanceLabelled: {
        header: st('conformance'),
        cell: (item) => {
          const rating = conformanceRatingFromResults(item);

          return <SimpleRatingBadge rating={statusGetByValue(rating)} />;
        },
        // PDF export: colour cell using the conformance rating colour
        exportCellStyle: exportStyleFromValue(
          (item) => conformanceRatingFromResults(item),
          (v) => statusGetByValue(v)
        ),
      },
      LatestResultLabelled: {
        header: st('latest_result'),
        cell: (item) => {
          const result = latestResultValueFromData(item);
          if (_.isNil(result) || result === '') {
            return '-';
          }
          if (item.Unit) {
            return `${result} ${item.Unit}`;
          }

          return result;
        },
      },
      PreviousResultLabelled: {
        header: st('previous_result'),
        cell: (item) => {
          const result = previousResultValueFromData(item);
          if (_.isNil(result) || result === '') {
            return '-';
          }
          if (item.Unit) {
            return `${result} ${item.Unit}`;
          }

          return result;
        },
      },
      LatestResultDateLabelled: dateColumnFromConfig({
        header: { header: st('latest_result_date') },
        dateField: 'LatestResultDateLabelled',
      }),
      NextTestDate: dateColumnFromConfig({
        header: { header: st('nextTestDate') },
        dateField: 'NextTestDate',
      }),
      NextTestOverdueDate: dateColumnFromConfig({
        header: { header: st('nextTestOverdue') },
        dateField: 'NextTestOverdueDate',
      }),
      TestScheduleStatusLabelled: {
        header: st('testScheduleStatus'),
        cell: (item) => {
          if (!item.TestScheduleStatus || item.TestScheduleStatus === '-') {
            return '-';
          }

          return (
            <SimpleRatingBadge
              rating={getByValueTestScheduleStatus(item.TestScheduleStatus)}
            >
              {item.TestScheduleStatusLabelled}
            </SimpleRatingBadge>
          );
        },
      },
      Unit: {
        formId: 'indicator',
        fieldId: 'Unit',
        cell: (item) => item.Unit || '-',
      },
      CreatedAtTimestamp: dateColumnFromConfig({
        header: { header: stc('created_on') },
        dateField: 'CreatedAtTimestamp',
      }),
      ModifiedAtTimestamp: dateColumnFromConfig({
        header: { header: stc('updated_on') },
        dateField: 'ModifiedAtTimestamp',
      }),
      allOwners,
      allContributors,
      ParentType: {
        header: st('parent_type'),
        cell: (item) => item.ParentType,
      },
      ModifiedByUser: {
        header: stc('updated_by_id'),
      },
      ModifiedByUserName: {
        header: stc('updated_by_username'),
      },
      Id: {
        header: stc('guid'),
      },
      CreatedByUser: {
        header: stc('created_by_id'),
      },
      CreatedByUserName: {
        header: stc('created_by_username'),
      },
      LowerToleranceNum: {
        formId: 'indicator',
        fieldId: 'LowerToleranceNum',
      },
      UpperToleranceNum: {
        formId: 'indicator',
        fieldId: 'UpperToleranceNum',
      },
      LowerAppetiteNum: {
        formId: 'indicator',
        fieldId: 'LowerAppetiteNum',
      },
      UpperAppetiteNum: {
        formId: 'indicator',
        fieldId: 'UpperAppetiteNum',
      },
      TargetValueTxt: {
        formId: 'indicator',
        fieldId: 'TargetValueTxt',
      },
      tags: tagField,
      departments: departmentField,
      ConformanceTrend: {
        header: st('conformance_trend'),
        cell: (item) => {
          const rating = trendGetByValue(item.ConformanceTrendValue);

          return (
            <SimpleRatingBadge rating={rating}>
              {item.ConformanceTrend}
            </SimpleRatingBadge>
          );
        },
        // PDF export: colour cell using the trend rating colour
        exportCellStyle: exportStyleFromValue(
          (item) => item.ConformanceTrendValue,
          (v) => trendGetByValue(v)
        ),
      },
    }),
    [
      allContributors,
      allOwners,
      departmentField,
      st,
      statusGetByValue,
      stc,
      tagField,
      trendGetByValue,
      getByValueTestScheduleStatus,
    ]
  );
};

const useGetIndicatorTableProps = (
  records: IndicatorFlatFields[] | undefined
): UseGetTablePropsOptions<IndicatorTableFields> => {
  const { t: stc } = useTranslation(['common']);

  const fields = useGetFieldConfig();
  const labelledFields = useLabelledFields(records);

  return useMemo(
    () => ({
      customAttributeFormIds: ['indicator'],
      tableId: 'indicatorRegister',
      data: labelledFields,
      entityLabel: stc('indicators.entity_name'),
      emptyCollectionAction: <></>,
      preferencesStorageKey: 'IndicatorsRegisterTable-PreferencesV1',
      enableFiltering: true,
      initialColumns: [
        'Title',
        'ParentTitle',
        'TestFrequencyLabelled',
        'LatestResultLabelled',
        'ConformanceLabelled',
        'ConformanceTrend',
        'LatestResultDateLabelled',
      ],
      fields,
    }),
    [fields, labelledFields, stc]
  );
};

export const useGetCollectionTableProps = (
  records: IndicatorFlatFields[] | undefined
): TablePropsWithActions<IndicatorTableFields> => {
  const props = useGetIndicatorTableProps(records);

  return useGetTableProps(props);
};

export const useGetIndicatorSmartWidgetTableProps = (
  records: IndicatorFlatFields[] | undefined,
  statefulTableOptions: StatefulTableOptions<IndicatorTableFields>
): TablePropsWithActions<IndicatorTableFields> => {
  const props = useGetIndicatorTableProps(records);

  return useGetStatelessTableProps<IndicatorTableFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
