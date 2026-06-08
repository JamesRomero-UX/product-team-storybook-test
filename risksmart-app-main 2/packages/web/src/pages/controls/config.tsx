import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_COL_WIDTH } from 'src/App.config';
import IndicatorsPopover from 'src/components/indicators-popover/IndicatorsPopover';
import ResponsiveRatingBadges from 'src/components/responsive-rating-badges';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { getTestScheduleStatus } from 'src/utils/table/utils/testScheduleStatusHelper';

import Link from '@/components/link';
import { toLocalDate } from '@/utils/dateUtils';
import { useGetContributorsFieldConfig } from '@/utils/table/hooks/useGetContributorsFieldConfig';
import { useGetDepartmentFieldConfig } from '@/utils/table/hooks/useGetDepartmentFieldConfig';
import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import type {
  StatefulTableOptions,
  UseGetTablePropsOptions,
} from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetStatelessTableProps } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import { useGetTablePropsWithoutUrlHash } from '@/utils/table/hooks/useGetTablePropsWithoutUrlHash';
import { useGetTagFieldConfig } from '@/utils/table/hooks/useGetTagFieldConfig';
import { useLinkArrayField } from '@/utils/table/hooks/useLinkArrayField';
import {
  exportStyleFromLatestHistory,
  exportStyleFromOption,
  exportStyleFromValue,
} from '@/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { controlDetailsUrl } from '@/utils/urls';

import type { ControlFlatFields, ControlTableFields } from './types';
import { useGetControlGroupFieldConfig } from './useGetControlGroupFieldConfig';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (
  onEditRating?:
    | ((item: { controlId: string; ratingId: string }) => void)
    | null,
  useAbsoluteUrls: boolean = false
): TableFields<ControlTableFields> => {
  const allOwners = useGetOwnersFieldConfig<ControlTableFields>({
    formId: 'control',
    fieldId: 'Owners',
  });
  const allContributors = useGetContributorsFieldConfig<ControlTableFields>({
    formId: 'control',
    fieldId: 'Contributors',
  });
  const tagField = useGetTagFieldConfig<ControlTableFields>({
    formId: 'control',
    fieldId: 'tags',
  });
  const controlGroups = useGetControlGroupFieldConfig<ControlTableFields>();
  const { getByValue: getByValueOverallEffectiveness, options } =
    useRating('effectiveness');
  const { getByValue: getByValueDesignEffectiveness } = useRating(
    'design_effectiveness'
  );
  const { getByValue: getByValueTestScheduleStatus } = useRating(
    'test_schedule_status'
  );
  const { getByValue: getByValuePerformanceEffectiveness } = useRating(
    'performance_effectiveness'
  );
  const { getByValue: getEffectivenessTrendByValue } = useRating(
    'effectiveness_trend'
  );
  let maxRating = Number(
    options.sort(
      (a, b) =>
        (!isNaN(Number(b.value)) ? Number(b.value) : 0) -
        (!isNaN(Number(a.value)) ? Number(a.value) : 0)
    )[0].value
  );
  if (isNaN(maxRating)) {
    maxRating = 0;
  }
  const departmentField = useGetDepartmentFieldConfig<ControlTableFields>(
    (r) => r.departments,
    {
      formId: 'control',
      fieldId: 'departments',
    }
  );
  const { t: stc } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'controls.columns',
  });
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const associations = useLinkArrayField<ControlTableFields>(
    t('associations'),
    (r) => r.ParentTitle
  );

  return {
    SequentialIdLabel: { header: stc('id'), sortingField: 'SequentialId' },
    Title: {
      formId: 'control',
      fieldId: 'Title',
      cell: (item) => (
        <Link
          variant={'secondary'}
          href={useAbsoluteUrls ? controlDetailsUrl(item.Id) : item.Id}
          isRelativeUrl={!useAbsoluteUrls}
        >
          {item.Title}
        </Link>
      ),
      maxWidth: MAX_COL_WIDTH,
      isRowHeader: true,
    },
    ControlTypeLabelled: {
      formId: 'control',
      fieldId: 'Type',
      cell: (item) => item.ControlTypeLabelled,
    },
    ParentTitle: associations,
    allOwners,
    allContributors,
    DesignEffectivenessLabelled: {
      header: st('design_effectiveness'),
      cell: (item) => {
        return (
          <SimpleRatingBadge
            rating={getByValueDesignEffectiveness(item.DesignEffectiveness)}
          >
            {item.DesignEffectivenessLabelled}
          </SimpleRatingBadge>
        );
      },
      // PDF export: colour cell based on design effectiveness option
      exportCellStyle: exportStyleFromOption((item) =>
        getByValueDesignEffectiveness(item.DesignEffectiveness)
      ),
      exportVal: (item) =>
        getByValueDesignEffectiveness(item.DesignEffectiveness)?.label ?? '',
    },
    PerformanceEffectivenessLabelled: {
      header: st('performance_effectiveness'),
      cell: (item) => {
        return (
          <SimpleRatingBadge
            rating={getByValuePerformanceEffectiveness(
              item.PerformanceEffectiveness
            )}
          >
            {item.PerformanceEffectivenessLabelled}
          </SimpleRatingBadge>
        );
      },
      // PDF export: colour cell based on performance effectiveness option
      exportCellStyle: exportStyleFromOption((item) =>
        getByValuePerformanceEffectiveness(item.PerformanceEffectiveness)
      ),
      exportVal: (item) =>
        getByValuePerformanceEffectiveness(item.PerformanceEffectiveness)
          ?.label ?? '',
    },
    OverallEffectivenessLabelled: {
      header: st('effectiveness'),
      cell: (item) => {
        return (
          <SimpleRatingBadge
            rating={getByValueOverallEffectiveness(item.OverallEffectiveness)}
          >
            {item.OverallEffectivenessLabelled}
          </SimpleRatingBadge>
        );
      },
      // PDF export: colour cell based on overall effectiveness option
      exportCellStyle: exportStyleFromOption((item) =>
        getByValueOverallEffectiveness(item.OverallEffectiveness)
      ),
      exportVal: (item) =>
        getByValueOverallEffectiveness(item.OverallEffectiveness)?.label ?? '',
    },
    OverallEffectivenessHistory: {
      // TODO: translations
      header: 'Overall Effectiveness History',
      filterOptions: {
        filteringProperties: {
          operators: [],
        },
      },
      cell: (item) => {
        return (
          <ResponsiveRatingBadges
            maxRating={maxRating}
            invertRating={false}
            ratings={item.OverallEffectivenessHistory?.filter(
              (c) => c?.rating !== undefined
            ).map((c) => ({
              label: '-',
              ...getByValueOverallEffectiveness(c.rating),
              id: c.id,
              rating: c.rating,
              testDate: c.testDate,
              onClick: onEditRating
                ? () => onEditRating({ controlId: item.Id, ratingId: c.id })
                : undefined,
            }))}
          ></ResponsiveRatingBadges>
        );
      },
      minWidth: 160,
      // PDF: colour cell based on the latest history rating's colour
      exportCellStyle: exportStyleFromLatestHistory(
        (item) => item.OverallEffectivenessHistory,
        (rating) => getByValueOverallEffectiveness(rating)
      ),
      exportVal: (item) =>
        item.OverallEffectivenessHistory?.map(
          (c) =>
            `${toLocalDate(c.testDate)} ${getByValueOverallEffectiveness(c.rating)?.label}`
        ).join(',') ?? '',
    },
    OverallEffectivenessTrendLabelled: {
      header: st('effectiveness_trend'),
      sortingField: 'OverallEffectivenessTrendLabelled',
      cell: (item) => (
        <SimpleRatingBadge
          rating={getEffectivenessTrendByValue(item.OverallEffectivenessTrend)}
        >
          {item.OverallEffectivenessTrendLabelled}
        </SimpleRatingBadge>
      ),
      exportCellStyle: exportStyleFromValue(
        (item) => item.OverallEffectivenessTrend,
        (v) => getEffectivenessTrendByValue(v)
      ),
    },
    OpenIssues: {
      header: st('open_issues'),
      cell: (item) => item.OpenIssues ?? '-',
      filterOptions: {
        filteringProperties: {
          operators: ['!=', '>', '<', '>=', '<='],
        },
      },
    },
    LinkedIndicatorCount: {
      header: st('linked_indicators'),
      cell: (item) => (
        <IndicatorsPopover id={item.Id} count={item.LinkedIndicatorCount} />
      ),
    },
    IssueCount: {
      header: st('issues'),
      cell: (item) => item.IssueCount ?? '-',
      filterOptions: {
        filteringProperties: {
          operators: ['!=', '>', '<', '>=', '<='],
        },
      },
    },

    OpenActions: {
      header: st('open_actions'),
      cell: (item) => item.OpenActions ?? '-',
      filterOptions: {
        filteringProperties: {
          operators: ['!=', '>', '<', '>=', '<='],
        },
      },
    },
    tags: tagField,
    departments: departmentField,
    CreatedAtTimestamp: dateColumnFromConfig({
      header: { header: stc('created_on') },
      dateField: 'CreatedAtTimestamp',
    }),
    Description: {
      formId: 'control',
      fieldId: 'Description',
      cell: (item) => item.Description || '-',
      maxWidth: MAX_COL_WIDTH,
    },
    Id: {
      header: stc('guid'),
    },
    TestFrequency: {
      header: st('test_frequency'),
      cell: (item) => {
        return item.TestFrequency ?? '-';
      },
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
    LatestRatingDate: dateColumnFromConfig({
      header: { header: st('latest_rating_date') },
      dateField: 'LatestRatingDate',
    }),
    NextTestDate: dateColumnFromConfig({
      header: { header: st('next_test_date') },
      dateField: 'NextTestDate',
    }),
    NextTestOverdueDate: dateColumnFromConfig({
      header: { header: st('nextTestOverdue') },
      dateField: 'NextTestOverdueDate',
    }),
    ControlGroups: controlGroups,
    TestScheduleStatusLabelled: {
      header: 'Test schedule status',
      cell: (item) => {
        const status = getTestScheduleStatus(
          item.NextTestOverdueDate,
          item.NextTestDate
        );

        return (
          <SimpleRatingBadge rating={getByValueTestScheduleStatus(status)}>
            {item.TestScheduleStatusLabelled}
          </SimpleRatingBadge>
        );
      },
    },
  };
};

const useGetControlTableProps = (
  records: ControlFlatFields[] | undefined,
  onEditRating?:
    | ((item: { controlId: string; ratingId: string }) => void)
    | null,
  emptyCollectionAction: JSX.Element = <></>,
  useAbsoluteUrls: boolean = false
): UseGetTablePropsOptions<ControlTableFields> => {
  const { t: st } = useTranslation(['common'], { keyPrefix: 'controls' });
  const fields = useGetFieldConfig(onEditRating, useAbsoluteUrls);

  const labelledFields = useLabelledFields(records);

  return {
    tableId: 'controlRegister',
    data: labelledFields,
    entityLabel: st('entity_name'),
    emptyCollectionAction,
    preferencesStorageKey: 'ControlRegisterTable-PreferencesV2',
    enableFiltering: true,
    initialColumns: [
      'Title',
      'ControlTypeLabelled',
      'ParentTitle',
      'allOwners',
      'OverallEffectivenessLabelled',
      'OpenIssues',
      'OpenActions',
      'tags',
    ],
    fields,
    customAttributeFormIds: ['control'],
  };
};

export const useGetCollectionTableProps = (
  onEditRating: (item: { controlId: string; ratingId: string }) => void,
  records: ControlFlatFields[] | undefined,
  emptyCollectionAction: JSX.Element = <></>
): TablePropsWithActions<ControlTableFields> => {
  const props = useGetControlTableProps(
    records,
    onEditRating,
    emptyCollectionAction
  );

  return useGetTableProps(props);
};

export const useGetCollectionStatelessTableProps = (
  onEditRating: (item: { controlId: string; ratingId: string }) => void,
  records: ControlFlatFields[] | undefined,
  emptyCollectionAction: JSX.Element = <></>
): TablePropsWithActions<ControlTableFields> => {
  const props = useGetControlTableProps(
    records,
    onEditRating,
    emptyCollectionAction
  );

  return useGetTablePropsWithoutUrlHash(props);
};

export const useGetControlSmartWidgetTableProps = (
  records: ControlFlatFields[] | undefined,
  statefulTableOptions: StatefulTableOptions<ControlTableFields>
): TablePropsWithActions<ControlTableFields> => {
  const props = useGetControlTableProps(records, undefined, <></>, true);

  return useGetStatelessTableProps<ControlTableFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
