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
import { useGetDepartmentFieldConfig } from '@/utils/table/hooks/useGetDepartmentFieldConfig';
import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import type {
  StatefulTableOptions,
  UseGetTablePropsOptions,
} from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetStatelessTableProps } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import { exportStyleFromOption } from '@/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

import type { CauseFlatField, CauseRegisterFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (
  onCauseClick?: (cause: CauseRegisterFields) => void
): TableFields<CauseRegisterFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'causes.columns',
  });
  const { getByValue } = useRating('significance');
  const status = useRating('issue_assessment_status');
  const severity = useRating('severity');
  const allOwners = useGetOwnersFieldConfig<CauseRegisterFields>({
    formId: 'issue',
    fieldId: 'Owners',
    includeFromTypePostfix: true,
  });
  const allContributors = useGetContributorsFieldConfig<CauseRegisterFields>({
    formId: 'issue',
    fieldId: 'Contributors',
    includeFromTypePostfix: true,
  });
  const AssessmentDepartments =
    useGetDepartmentFieldConfig<CauseRegisterFields>(
      (r) => r.issue?.assessment?.departments ?? [],
      {
        formId: 'issue_assessment',
        fieldId: 'departments',
        includeFromTypePostfix: true,
      }
    );

  return useMemo<TableFields<CauseRegisterFields>>(
    () => ({
      Title: {
        formId: 'cause',
        fieldId: 'Title',
        custom: false,
        cell: (item) => (
          <Link onFollow={() => onCauseClick?.(item)}>{item.Title}</Link>
        ),
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
      SignificanceLabelled: {
        formId: 'cause',
        fieldId: 'Significance',
        cell: (item) => (
          <SimpleRatingBadge rating={getByValue(item.Significance)} />
        ),
        exportCellStyle: exportStyleFromOption((item) =>
          getByValue(item.Significance)
        ),
      },
      Description: {
        formId: 'cause',
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
      AssessmentDepartments,
    }),
    [
      st,
      allOwners,
      allContributors,
      t,
      AssessmentDepartments,
      onCauseClick,
      severity,
      status,
      getByValue,
    ]
  );
};

const useGetCauseTableProps = (
  records: CauseFlatField[] | undefined,
  onCauseClick?: (consequence: CauseRegisterFields) => void
): UseGetTablePropsOptions<CauseRegisterFields> => {
  const { t } = useTranslation(['common']);
  const data = useLabelledFields(records);
  const fields = useGetFieldConfig(onCauseClick);

  return useMemo(
    () => ({
      data,
      tableId: 'causeRegister',
      customAttributeFormIds: ['cause'],
      entityLabel: t('cause_one'),
      emptyCollectionAction: <></>,
      preferencesStorageKey: 'CausesRegisterTable-PreferencesV1',
      enableFiltering: true,
      initialColumns: [
        'Title',
        'IssueTitle',
        'Significance',
        'Description',
        'IssueStatusLabelled',
      ],
      fields,
    }),
    [data, fields, t]
  );
};

export const useGetRegisterTableProps = (
  records: CauseFlatField[] | undefined,
  onConsequenceClick?: (consequence: CauseRegisterFields) => void
): TablePropsWithActions<CauseRegisterFields> => {
  const props = useGetCauseTableProps(records, onConsequenceClick);

  return useGetTableProps(props);
};

export const useGetCauseSmartWidgetTableProps = (
  records: CauseFlatField[] | undefined,
  statefulTableOptions: StatefulTableOptions<CauseRegisterFields>
): TablePropsWithActions<CauseRegisterFields> => {
  const props = useGetCauseTableProps(records);

  return useGetStatelessTableProps<CauseRegisterFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
