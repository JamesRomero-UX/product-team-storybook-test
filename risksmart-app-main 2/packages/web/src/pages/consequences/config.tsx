import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { useGetContributorsFieldConfig } from 'src/utils/table/hooks/useGetContributorsFieldConfig';

import Link from '@/components/link';
import { EMPTY_CELL } from '@/utils/collectionUtils';
import { getFriendlyId } from '@/utils/friendlyId';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';
import { roundToTwoDecimals } from '@/utils/numberUtils';
import { useGetDepartmentFieldConfig } from '@/utils/table/hooks/useGetDepartmentFieldConfig';
import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import type {
  StatefulTableOptions,
  UseGetTablePropsOptions,
} from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetStatelessTableProps } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import { useGetTagFieldConfig } from '@/utils/table/hooks/useGetTagFieldConfig';
import { exportStyleFromOption } from '@/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

import type { ConsequenceFlatField, ConsequenceRegisterFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (
  onConsequenceClick?: (consequence: ConsequenceRegisterFields) => void
): TableFields<ConsequenceRegisterFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'consequences.columns',
  });
  const allOwners = useGetOwnersFieldConfig<ConsequenceRegisterFields>({
    formId: 'issue',
    fieldId: 'Owners',
    includeFromTypePostfix: true,
  });
  const allContributors =
    useGetContributorsFieldConfig<ConsequenceRegisterFields>({
      formId: 'issue',
      fieldId: 'Contributors',
      includeFromTypePostfix: true,
    });
  const tagField = useGetTagFieldConfig<ConsequenceRegisterFields>({
    formId: 'issue',
    fieldId: 'tags',
    includeFromTypePostfix: true,
  });
  const departmentField =
    useGetDepartmentFieldConfig<ConsequenceRegisterFields>(
      (r) => r.departments,
      {
        formId: 'issue',
        fieldId: 'departments',
        includeFromTypePostfix: true,
      }
    );
  const assessmentDepartments =
    useGetDepartmentFieldConfig<ConsequenceRegisterFields>(
      (r) => r.issue?.assessment?.departments ?? [],
      {
        formId: 'issue_assessment',
        fieldId: 'departments',
        includeFromTypePostfix: true,
      }
    );

  const status = useRating('issue_assessment_status');
  const severity = useRating('severity');
  const { getByValue: getCriticalityByValue } = useRating('criticality');

  return useMemo(
    () => ({
      Title: {
        formId: 'consequence',
        fieldId: 'Title',
        cell: (item) => (
          <Link onFollow={() => onConsequenceClick?.(item)}>{item.Title}</Link>
        ),
        isRowHeader: true,
      },
      TypeLabelled: {
        formId: 'consequence',
        fieldId: 'Type',
      },
      IssueTitle: {
        formId: 'issue',
        fieldId: 'Title',
        includeFromTypePostfix: true,
        cell: (item) => {
          const issueType =
            IssueTypeMapping[(item.issue?.Type ?? 'issue') as ParentIssueType];

          return (
            <Link href={issueType.detailsUrl(item.ParentIssueId)}>
              {item.IssueTitle}
            </Link>
          );
        },
        isRowHeader: true,
      },
      IssueSequentialId: {
        header: st('issueId'),
        cell: (item) =>
          item.IssueSequentialId && item.issue
            ? getFriendlyId(item.issue.Type, item.IssueSequentialId)
            : '-',
        exportVal: (item) =>
          item.IssueSequentialId && item.issue
            ? getFriendlyId(item.issue.Type, item.IssueSequentialId)
            : '-',
      },
      IssueSeverityLabelled: {
        formId: 'issue_assessment',
        fieldId: 'Severity',
        includeFromTypePostfix: true,
        cell: (item) => {
          const rating = severity.getByValue(item.IssueSeverity);

          return rating ? (
            <SimpleRatingBadge rating={rating}>
              {item.IssueSeverity}
            </SimpleRatingBadge>
          ) : (
            EMPTY_CELL
          );
        },
        exportCellStyle: exportStyleFromOption((item) =>
          severity.getByValue(item.IssueSeverity)
        ),
      },
      IssueStatusLabelled: {
        formId: 'issue_assessment',
        fieldId: 'Status',
        includeFromTypePostfix: true,
        cell: (item) => {
          const rating = status.getByValue(item.IssueStatus);

          return rating ? <SimpleRatingBadge rating={rating} /> : EMPTY_CELL;
        },
        exportCellStyle: exportStyleFromOption((item) =>
          status.getByValue(item.IssueStatus)
        ),
      },
      IssueTypeLabelled: {
        formId: 'issue_assessment',
        fieldId: 'IssueType',
        includeFromTypePostfix: true,
      },
      ParentTypeLabelled: {
        header: t('parentType'),
      },
      IssueRaisedDate: dateColumnFromConfig({
        header: {
          header: st('issueRaisedDate'),
        },
        dateField: 'IssueRaisedDate',
      }),
      IssueClosedDate: dateColumnFromConfig({
        header: {
          formId: 'issue_assessment',
          fieldId: 'ActualCloseDate',
          includeFromTypePostfix: true,
        },
        dateField: 'IssueClosedDate',
      }),
      allOwners,
      allContributors,
      departments: departmentField,
      tags: tagField,
      CostTypeLabelled: {
        formId: 'consequence',
        fieldId: 'CostType',
      },
      CostValue: {
        formId: 'consequence',
        fieldId: 'CostValue',
        cell: (item) => {
          return roundToTwoDecimals(item.CostValue).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        },
        exportVal: (item) => {
          return roundToTwoDecimals(item.CostValue).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        },
        fieldType: 'number',
      },
      CostFinancial: {
        header: st('costFinancial'),
        cell: (item) => {
          return roundToTwoDecimals(item.CostFinancial ?? 0).toLocaleString(
            undefined,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          );
        },
        exportVal: (item) => {
          return roundToTwoDecimals(item.CostFinancial ?? 0).toLocaleString(
            undefined,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          );
        },
        fieldType: 'number',
        footerVal: (records) => {
          const total = records.reduce(
            (previousVal, currentValue) =>
              previousVal + (currentValue.CostFinancial ?? 0),
            0
          );

          // Round to 2 decimal places to handle floating point precision issues
          return roundToTwoDecimals(total).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        },
      },
      CostHours: {
        header: st('costHours'),
        fieldType: 'number',
        cell: (item) => {
          return roundToTwoDecimals(item.CostHours ?? 0).toLocaleString(
            undefined,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          );
        },
        exportVal: (item) => {
          return roundToTwoDecimals(item.CostHours ?? 0).toLocaleString(
            undefined,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          );
        },
        footerVal: (records) => {
          const total = records.reduce(
            (previousVal, currentValue) =>
              previousVal + (currentValue.CostHours ?? 0),
            0
          );

          // Round to 2 decimal places to handle floating point precision issues
          return roundToTwoDecimals(total).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        },
      },
      CostNumber: {
        header: st('costNumber'),
        fieldType: 'number',
        cell: (item) => {
          return roundToTwoDecimals(item.CostNumber ?? 0).toLocaleString(
            undefined,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          );
        },
        exportVal: (item) => {
          return roundToTwoDecimals(item.CostNumber ?? 0).toLocaleString(
            undefined,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          );
        },
        footerVal: (records) => {
          const total = records.reduce(
            (previousVal, currentValue) =>
              previousVal + (currentValue.CostNumber ?? 0),
            0
          );

          // Round to 2 decimal places to handle floating point precision issues
          return roundToTwoDecimals(total).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        },
      },
      CriticalityLabelled: {
        formId: 'consequence',
        fieldId: 'Criticality',
        cell: (item) => (
          <SimpleRatingBadge rating={getCriticalityByValue(item.Criticality)} />
        ),
        exportCellStyle: exportStyleFromOption((item) =>
          getCriticalityByValue(item.Criticality)
        ),
      },
      Description: {
        formId: 'consequence',
        fieldId: 'Description',
      },
      CreatedAtTimestamp: dateColumnFromConfig({
        header: { header: t('created_on') },
        dateField: 'CreatedAtTimestamp',
      }),
      ModifiedAtTimestamp: dateColumnFromConfig({
        header: { header: t('updated_on') },
        dateField: 'ModifiedAtTimestamp',
      }),
      ModifiedByUser: { header: t('updated_by_id') },
      ModifiedByUserName: { header: t('updated_by_username') },
      CreatedByUserName: { header: t('created_by_username') },
      AssessmentDepartments: assessmentDepartments,
    }),
    [
      st,
      allOwners,
      allContributors,
      departmentField,
      tagField,
      t,
      assessmentDepartments,
      onConsequenceClick,
      severity,
      status,
      getCriticalityByValue,
    ]
  );
};

const useGetConsequenceTableProps = (
  records: ConsequenceFlatField[] | undefined,
  onConsequenceClick?: (consequence: ConsequenceRegisterFields) => void
): UseGetTablePropsOptions<ConsequenceRegisterFields> => {
  const { t } = useTranslation(['common']);
  const data = useLabelledFields(records);
  const fields = useGetFieldConfig(onConsequenceClick);

  return useMemo(
    () => ({
      tableId: 'consequenceRegister',
      data,
      entityLabel: t('consequence_one'),
      emptyCollectionAction: <></>,
      preferencesStorageKey: 'ConsequencesRegisterTable-PreferencesV1',
      enableFiltering: true,
      initialColumns: [
        'Title',
        'IssueTitle',
        'CostTypeLabelled',
        'CostValue',
        'CriticalityLabelled',
      ],
      fields,
      customAttributeFormIds: ['consequence'],
    }),
    [data, fields, t]
  );
};

export const useGetRegisterTableProps = (
  records: ConsequenceFlatField[] | undefined,
  onConsequenceClick?: (consequence: ConsequenceRegisterFields) => void
): TablePropsWithActions<ConsequenceRegisterFields> => {
  const props = useGetConsequenceTableProps(records, onConsequenceClick);

  return useGetTableProps(props);
};

export const useGetConsequenceSmartWidgetTableProps = (
  records: ConsequenceFlatField[] | undefined,
  statefulTableOptions: StatefulTableOptions<ConsequenceRegisterFields>
): TablePropsWithActions<ConsequenceRegisterFields> => {
  const props = useGetConsequenceTableProps(records);

  return useGetStatelessTableProps<ConsequenceRegisterFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
