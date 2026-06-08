import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { Obligation_Assessment_Result } from '@risksmart-app/web-graphql-client/derived-types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_COL_WIDTH } from 'src/App.config';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { Permission } from 'src/rbac/Permission';
import type { RecursivePartial } from 'src/testing/stub';

import Link from '@/components/link';
import { useGetContributorsFieldConfig } from '@/utils/table/hooks/useGetContributorsFieldConfig';
import { useGetDepartmentFieldConfig } from '@/utils/table/hooks/useGetDepartmentFieldConfig';
import { useGetIssuesFieldConfig } from '@/utils/table/hooks/useGetIssuesFieldConfig';
import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import type {
  StatefulTableOptions,
  UseGetTablePropsOptions,
} from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetStatelessTableProps } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import { useGetTagFieldConfig } from '@/utils/table/hooks/useGetTagFieldConfig';
import { exportStyleFromValue } from '@/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { addObligationUrl, obligationDetailsUrl } from '@/utils/urls';

import type { ObligationFields, ObligationTableFields } from './types';
import { useGetLabelledFields } from './useLabelledFields';

export const useGetFieldConfig = (): TableFields<ObligationTableFields> => {
  const allOwners = useGetOwnersFieldConfig<ObligationTableFields>({
    formId: 'obligation',
    fieldId: 'Owners',
  });
  const allContributors = useGetContributorsFieldConfig<ObligationTableFields>({
    formId: 'obligation',
    fieldId: 'Contributors',
  });
  const tagField = useGetTagFieldConfig<ObligationTableFields>({
    formId: 'obligation',
    fieldId: 'tags',
  });
  const departmentField = useGetDepartmentFieldConfig<ObligationTableFields>(
    (r) => r.departments,
    {
      formId: 'obligation',
      fieldId: 'departments',
    }
  );
  // TODO: this should come form issue assessment, but that requires get the form config form issue assessments (whilst not including the custom attributes for this form)
  const issueField = useGetIssuesFieldConfig<ObligationTableFields>();
  const { getByValue: statusGetByValue } = useRating('assessment_status');
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'obligations.columns',
  });
  const { t } = useTranslation(['common'], {
    keyPrefix: 'columns',
  });
  const { t: tr } = useTranslation(['ratings']);
  const { getByValue: getRatingTrendByValue } = useRating(
    'effectiveness_trend'
  );

  return useMemo(
    () => ({
      SequentialIdLabel: { header: t('id'), sortingField: 'SequentialId' },
      Title: {
        formId: 'obligation',
        fieldId: 'Title',
        cell: (item) => (
          <Link variant={'secondary'} href={obligationDetailsUrl(item.Id)}>
            {item.Title}
          </Link>
        ),
        isRowHeader: true,
      },
      ParentTitle: {
        formId: 'obligation',
        fieldId: 'ParentId',
        cell: (item) => item.ParentTitle ?? '-',
      },
      TypeLabel: {
        formId: 'obligation',
        fieldId: 'Type',
      },
      allOwners,
      allContributors,
      LatestAssessmentResultsLabelled: {
        header: st('Rating'),
        cell: (item) => {
          const result = item.LatestAssessmentResult;
          const [rating] = [
            ...tr('performance_result_unrated'),
            ...tr('performance_result'),
          ].filter((res) => res.value === result);

          return <SimpleRatingBadge rating={rating} />;
        },
        // PDF export: colour cell using the performance result rating colour
        exportCellStyle: exportStyleFromValue(
          (item) => item.LatestAssessmentResult,
          (v) =>
            [
              ...tr('performance_result_unrated'),
              ...tr('performance_result'),
            ].find((res) => res.value === v)
        ),
      },
      LatestAssessmentStatus: {
        header: st('AssessmentStatus'),
        cell: (item) => {
          return (
            <SimpleRatingBadge
              rating={statusGetByValue(item.LatestAssessmentStatus)}
            />
          );
        },
        // PDF export: colour cell using the assessment status rating colour
        exportCellStyle: exportStyleFromValue(
          (item) => item.LatestAssessmentStatus,
          (v) => statusGetByValue(v)
        ),
      },
      LinkedControlCount: {
        header: st('Controls'),
      },
      BreachedIssues: issueField,
      tags: tagField,
      departments: departmentField,
      CreatedAtTimestamp: dateColumnFromConfig({
        header: { header: st('CreatedAt') },
        dateField: 'CreatedAtTimestamp',
      }),
      ModifiedAtTimestamp: dateColumnFromConfig({
        header: { header: st('ModifiedAt') },
        dateField: 'ModifiedAtTimestamp',
      }),
      Description: {
        formId: 'obligation',
        fieldId: 'Description',
        cell: (item) => item.Description || '-',
        maxWidth: MAX_COL_WIDTH,
      },
      Id: {
        header: t('guid'),
      },
      CreatedBy: {
        header: st('CreatedBy'),
        cell: (item) => item.CreatedBy ?? '-',
      },
      ModifiedBy: {
        header: st('ModifiedBy'),
        cell: (item) => item.ModifiedBy ?? '-',
      },
      ParentId: {
        header: st('ParentId'),
        cell: (item) => item.ParentId || '-',
      },
      LatestRatingDate: dateColumnFromConfig({
        header: { header: st('latest_rating_date') },
        dateField: 'LatestRatingDate',
      }),
      NextTestDate: dateColumnFromConfig({
        header: { header: st('next_test_date') },
        dateField: 'NextTestDate',
      }),
      TestFrequency: {
        header: st('test_frequency'),
        cell: (item) => {
          return item.TestFrequency ?? '-';
        },
      },
      RatingTrendLabelled: {
        header: st('RatingTrend'),
        sortingField: 'RatingTrendLabelled',
        cell: (item) => (
          <SimpleRatingBadge rating={getRatingTrendByValue(item.RatingTrend)}>
            {item.RatingTrendLabelled}
          </SimpleRatingBadge>
        ),
        exportCellStyle: exportStyleFromValue(
          (item) => item.RatingTrend,
          (v) => getRatingTrendByValue(v)
        ),
      },
    }),
    [
      allContributors,
      allOwners,
      departmentField,
      getRatingTrendByValue,
      issueField,
      st,
      statusGetByValue,
      t,
      tagField,
      tr,
    ]
  );
};

const useGetObligationTableProps = (
  records: ObligationFields[] | undefined,
  latestAssessmentResults:
    | Array<null | RecursivePartial<Obligation_Assessment_Result> | undefined>
    | undefined
): UseGetTablePropsOptions<ObligationTableFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'obligations' });
  const fields = useGetFieldConfig();
  const labelledFields = useGetLabelledFields(records, latestAssessmentResults);

  return useMemo(
    () => ({
      tableId: 'obligationRegister',
      data: labelledFields,
      entityLabel: t('entity_name'),
      emptyCollectionAction: (
        <Permission permission={'insert:obligation'}>
          <Button href={addObligationUrl()}>{t('create_button')}</Button>
        </Permission>
      ),
      preferencesStorageKey: 'ObligationRegisterTable-PreferencesV1',
      enableFiltering: true,
      initialColumns: [
        'Title',
        'ParentTitle',
        'TypeLabel',
        'allOwners',
        'LatestAssessmentResultsLabelled',
        'LatestAssessmentStatus',
        'LinkedControlCount',
        'tags',
        'departments',
      ],
      fields,
      customAttributeFormIds: ['obligation'],
    }),
    [fields, labelledFields, t]
  );
};

export const useGetCollectionTableProps = (
  records: ObligationFields[] | undefined,
  latestAssessmentResults:
    | Array<null | RecursivePartial<Obligation_Assessment_Result> | undefined>
    | undefined
): TablePropsWithActions<ObligationTableFields> => {
  const props = useGetObligationTableProps(records, latestAssessmentResults);

  return useGetTableProps(props);
};

export const useGetObligationSmartWidgetTableProps = (
  records: ObligationFields[] | undefined,
  latestAssessmentResults:
    | Array<null | RecursivePartial<Obligation_Assessment_Result> | undefined>
    | undefined,
  statefulTableOptions: StatefulTableOptions<ObligationTableFields>
): TablePropsWithActions<ObligationTableFields> => {
  const props = useGetObligationTableProps(records, latestAssessmentResults);

  return useGetStatelessTableProps<ObligationTableFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
