import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { Document_Assessment_Result } from '@risksmart-app/web-graphql-client/derived-types';
import { LinkExternal01 } from '@untitled-ui/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PolicyDocumentStatusBadge from 'src/components/policy-document-status-badge/PolicyDocumentStatusBadge';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { Permission } from 'src/rbac/Permission';
import type { RecursivePartial } from 'src/testing/stub';

import Link from '@/components/link';
import { EMPTY_CELL } from '@/utils/collectionUtils';
import { useGetContributorsFieldConfig } from '@/utils/table/hooks/useGetContributorsFieldConfig';
import { useGetDepartmentFieldConfig } from '@/utils/table/hooks/useGetDepartmentFieldConfig';
import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import type {
  StatefulTableOptions,
  UseGetTablePropsOptions,
} from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetStatelessTableProps } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import { useGetTagFieldConfig } from '@/utils/table/hooks/useGetTagFieldConfig';
import {
  exportStyleFromOption,
  exportStyleFromValue,
} from '@/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import {
  addPolicyUrl,
  policyDetailsUrl,
  publicPolicyFileUrl,
} from '@/utils/urls';

import type { DocumentFields, PolicyRegisterFields } from './types';
import { useLabelledFields } from './useLabelledFields';

export const useGetFieldConfig = (): TableFields<PolicyRegisterFields> => {
  const allOwners = useGetOwnersFieldConfig<PolicyRegisterFields>({
    formId: 'document',
    fieldId: 'Owners',
  });
  const allContributors = useGetContributorsFieldConfig<PolicyRegisterFields>({
    formId: 'document',
    fieldId: 'Contributors',
  });
  const tagField = useGetTagFieldConfig<PolicyRegisterFields>({
    formId: 'document',
    fieldId: 'tags',
  });
  const departmentField = useGetDepartmentFieldConfig<PolicyRegisterFields>(
    (r) => r.departments,
    {
      formId: 'document',
      fieldId: 'departments',
    }
  );
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { getByValue: getPerformanceByValue } = useRating('performance_result');
  const { getByValue: getRatingTrendByValue } = useRating(
    'effectiveness_trend'
  );
  const { getByValue: getVersionStatusByValue, options: versionStatusOptions } =
    useRating('document_file_status');
  const { getByValue: getReviewStatusByValue, options: reviewStatusOptions } =
    useRating('document_review_status');
  const { t: st } = useTranslation(['common'], { keyPrefix: 'policy.columns' });

  return useMemo(
    () => ({
      SequentialIdLabel: { header: t('id'), sortingField: 'SequentialId' },
      Title: {
        formId: 'document',
        fieldId: 'Title',
        cell: (item) => (
          <Link variant={'secondary'} href={policyDetailsUrl(item.Id)}>
            {item.Title}
          </Link>
        ),
        isRowHeader: true,
        sortingComparator: (a, b) =>
          a.Title.localeCompare(b.Title, undefined, { numeric: true }),
      },
      Parent: {
        formId: 'document',
        fieldId: 'ParentDocument',
      },
      DocumentType: {
        formId: 'document',
        fieldId: 'DocumentType',
      },
      allOwners,
      allContributors,
      PerformanceResult: {
        header: st('rating'),
        cell: (item) => (
          <SimpleRatingBadge
            rating={getPerformanceByValue(item.PerformanceResultValue)}
          />
        ),
        exportCellStyle: exportStyleFromOption((item) =>
          getPerformanceByValue(item.PerformanceResultValue)
        ),
      },
      PerformanceTrendLabelled: {
        header: st('performanceTrend'),
        sortingField: 'PerformanceTrendLabelled',
        cell: (item) => (
          <SimpleRatingBadge
            rating={getRatingTrendByValue(item.PerformanceTrend)}
          >
            {item.PerformanceTrendLabelled}
          </SimpleRatingBadge>
        ),
        exportCellStyle: exportStyleFromValue(
          (item) => item.PerformanceTrend,
          (v) => getRatingTrendByValue(v)
        ),
      },
      Status: {
        header: st('status'),
        cell: (item) =>
          item.StatusValue ? (
            <PolicyDocumentStatusBadge
              item={{
                Status: item.StatusValue,
              }}
            />
          ) : (
            EMPTY_CELL
          ),
        sortingComparator: (a, b) =>
          a.VersionStatusSortKey - b.VersionStatusSortKey,
        filterOptions: {
          filteringOptions: versionStatusOptions.map((o) => ({
            value: o.label,
            label: o.label,
          })),
        },
        exportVal: (item) => item.Status,
        exportCellStyle: exportStyleFromOption((item) =>
          getVersionStatusByValue(item.StatusValue)
        ),
      },
      ReviewStatus: {
        header: st('review_status'),
        cell: (item) =>
          item.ReviewStatusValue && item.ReviewStatusValue !== 'not_set' ? (
            <SimpleRatingBadge
              rating={getReviewStatusByValue(item.ReviewStatusValue)}
            />
          ) : (
            EMPTY_CELL
          ),
        sortingComparator: (a, b) =>
          a.ReviewStatusSortKey - b.ReviewStatusSortKey,
        filterOptions: {
          filteringOptions: reviewStatusOptions.map((o) => ({
            value: o.label,
            label: o.label,
          })),
        },
        exportVal: (item) => item.ReviewStatus,
        exportCellStyle: exportStyleFromOption((item) =>
          getReviewStatusByValue(item.ReviewStatusValue)
        ),
      },
      ReviewDate: dateColumnFromConfig({
        header: { header: st('review_date') },
        dateField: 'ReviewDate',
      }),
      NextReviewDate: dateColumnFromConfig({
        header: { header: st('review_due') },
        dateField: 'NextReviewDate',
      }),
      tags: tagField,
      departments: departmentField,
      Id: {
        header: t('guid'),
      },
      CreatedByUserName: {
        header: t('created_by_username'),
      },
      ModifiedByUserName: {
        header: t('updated_by_username'),
      },
      CreatedAtTimestamp: dateColumnFromConfig({
        header: { header: t('created_on') },
        dateField: 'CreatedAtTimestamp',
      }),
      ModifiedAtTimestamp: dateColumnFromConfig({
        header: { header: t('updated_on') },
        dateField: 'ModifiedAtTimestamp',
      }),
      CreatedByUserId: { header: t('created_by_id') },
      ModifiedByUserId: { header: t('updated_by_id') },
      Download: {
        header: st('download'),
        cell: (item) => {
          return item.Download ? (
            <Link href={publicPolicyFileUrl(item.Id)}>
              {st('download')}
              <LinkExternal01
                width={'15px'}
                height={'15px'}
                className={'ml-2'}
                viewBox={'0 0 24 24'}
              />
            </Link>
          ) : (
            EMPTY_CELL
          );
        },
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
      TestFrequency: {
        header: st('test_frequency'),
        cell: (item) => {
          return item.TestFrequency ?? '-';
        },
      },
      LastApprovedDate: dateColumnFromConfig({
        header: { header: st('lastApprovedDate') },
        dateField: 'LastApprovedDate',
      }),
      LastPublishedDate: dateColumnFromConfig({
        header: { header: st('lastPublishedDate') },
        dateField: 'LastPublishedDate',
        onClick: undefined,
        includeTime: false,
      }),
    }),
    [
      allContributors,
      allOwners,
      departmentField,
      getPerformanceByValue,
      getRatingTrendByValue,
      getReviewStatusByValue,
      getVersionStatusByValue,
      reviewStatusOptions,
      versionStatusOptions,
      st,
      t,
      tagField,
    ]
  );
};

const useGetPolicyTableProps = (
  records: DocumentFields[] | undefined,
  documentAssessmentResults:
    | Array<null | RecursivePartial<Document_Assessment_Result> | undefined>
    | undefined
): UseGetTablePropsOptions<PolicyRegisterFields> => {
  const { t: st } = useTranslation(['common'], { keyPrefix: 'policy' });

  const fields = useGetFieldConfig();
  const labelledFields = useLabelledFields(records, documentAssessmentResults);

  return useMemo(
    () => ({
      tableId: 'policyRegister',
      data: labelledFields,
      customAttributeFormIds: ['document'],
      entityLabel: st('entity_name'),
      emptyCollectionAction: (
        <Permission permission={'insert:document'}>
          <Button href={addPolicyUrl()}>{st('create_new_button')}</Button>
        </Permission>
      ),
      preferencesStorageKey: 'PolicyRegisterTable-Preferences',
      enableFiltering: true,
      initialColumns: [
        'Title',
        'Parent',
        'DocumentType',
        'allOwners',
        'PerformanceResult',
        'Status',
        'ReviewStatus',
        'tags',
        'departments',
        'Download',
      ],
      fields,
    }),
    [fields, labelledFields, st]
  );
};

export const useGetCollectionTableProps = (
  records: DocumentFields[] | undefined,
  documentAssessmentResults:
    | Array<null | RecursivePartial<Document_Assessment_Result> | undefined>
    | undefined
): TablePropsWithActions<PolicyRegisterFields> => {
  const props = useGetPolicyTableProps(records, documentAssessmentResults);

  return useGetTableProps(props);
};

export const useGetPolicySmartWidgetTableProps = (
  records: DocumentFields[] | undefined,
  documentAssessmentResults:
    | Array<null | RecursivePartial<Document_Assessment_Result> | undefined>
    | undefined,
  statefulTableOptions: StatefulTableOptions<PolicyRegisterFields>
): TablePropsWithActions<PolicyRegisterFields> => {
  const props = useGetPolicyTableProps(records, documentAssessmentResults);

  return useGetStatelessTableProps<PolicyRegisterFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
