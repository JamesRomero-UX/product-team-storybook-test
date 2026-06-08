import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import Link from '@/components/link';
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
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { internalAuditReportDetailsUrl } from '@/utils/urls';

import type {
  InternalAuditReportFields,
  InternalAuditReportRegisterFields,
} from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (
  useAbsoluteUrls?: boolean
): TableFields<InternalAuditReportRegisterFields> => {
  const { t } = useTranslation('common', {
    keyPrefix: 'internalAuditReports.columns',
  });
  const allOwners = useGetOwnersFieldConfig<InternalAuditReportRegisterFields>({
    formId: 'internal_audit_report',
    fieldId: 'Owners',
  });
  const allContributors =
    useGetContributorsFieldConfig<InternalAuditReportRegisterFields>({
      formId: 'internal_audit_report',
      fieldId: 'Contributors',
    });
  const { getByValue: statusGetByValue } = useRating('assessment_status');
  const { getByValue: outcomeGetByValue } = useRating(
    'internal_audit_report_outcome'
  );
  const tagField = useGetTagFieldConfig<InternalAuditReportRegisterFields>({
    formId: 'internal_audit_report',
    fieldId: 'tags',
  });
  const departmentField =
    useGetDepartmentFieldConfig<InternalAuditReportRegisterFields>(
      (r) => r.departments,
      {
        formId: 'internal_audit_report',
        fieldId: 'departments',
      }
    );
  const { t: gt } = useTranslation(['common'], { keyPrefix: 'columns' });

  return useMemo(
    () => ({
      Title: {
        formId: 'internal_audit_report',
        fieldId: 'Title',
        cell: (item) => {
          return (
            <Link
              isRelativeUrl={!useAbsoluteUrls}
              variant={'secondary'}
              href={
                useAbsoluteUrls
                  ? internalAuditReportDetailsUrl(item.Id)
                  : item.Id
              }
            >
              {item.Title}
            </Link>
          );
        },
        isRowHeader: true,
      },
      StartDate: dateColumnFromConfig({
        header: { formId: 'internal_audit_report', fieldId: 'StartDate' },
        dateField: 'StartDate',
      }),
      ActualCompletionDate: dateColumnFromConfig({
        header: {
          formId: 'internal_audit_report',
          fieldId: 'ActualCompletionDate',
        },
        dateField: 'ActualCompletionDate',
      }),
      StatusLabelled: {
        formId: 'internal_audit_report',
        fieldId: 'Status',
        cell: (item) => (
          <SimpleRatingBadge rating={statusGetByValue(item.Status)} />
        ),
      },
      OutcomeLabelled: {
        formId: 'internal_audit_report',
        fieldId: 'Outcome',
        cell: (item) => (
          <SimpleRatingBadge rating={outcomeGetByValue(item.Outcome)} />
        ),
      },
      AssessedItems: {
        header: t('AssessedItems'),
      },
      TargetCompletionDate: dateColumnFromConfig({
        header: {
          formId: 'internal_audit_report',
          fieldId: 'TargetCompletionDate',
        },
        dateField: 'TargetCompletionDate',
      }),
      completedByUser: {
        formId: 'internal_audit_report',
        fieldId: 'CompletedByUser',
        cell: (item) => item.completedByUser?.FriendlyName,
      },
      CreatedAtTimestamp: dateColumnFromConfig({
        header: { header: t('created_on') },
        dateField: 'CreatedAtTimestamp',
      }),
      ModifiedByUser: {
        header: t('updated_by_id'),
      },
      SequentialIdLabel: {
        header: t('id'),
        sortingField: 'SequentialId',
      },
      Id: {
        header: gt('guid'),
      },

      NextTestDate: dateColumnFromConfig({
        header: { formId: 'internal_audit_report', fieldId: 'NextTestDate' },
        dateField: 'NextTestDate',
      }),
      ModifiedAtTimestamp: dateColumnFromConfig({
        header: { header: t('updated_on') },
        dateField: 'ModifiedAtTimestamp',
      }),
      CreatedByUser: {
        header: t('created_by_id'),
      },
      allOwners,
      allContributors,
      tags: tagField,
      departments: departmentField,
    }),
    [
      allContributors,
      allOwners,
      departmentField,
      gt,
      outcomeGetByValue,
      statusGetByValue,
      t,
      tagField,
      useAbsoluteUrls,
    ]
  );
};

export const enum AssessmentStatus {
  Complete = 'complete',
  Inprogress = 'inprogress',
  NotStarted = 'notstarted',
}

export const getStatusByDate = (
  now: Dayjs,
  startDate?: null | string,
  completionDate?: null | string
): AssessmentStatus => {
  if (dayjs(completionDate).isBefore(now)) {
    return AssessmentStatus.Complete;
  }
  if (!startDate) {
    return AssessmentStatus.NotStarted;
  }

  return AssessmentStatus.Inprogress;
};

const useGetProps = (
  records: InternalAuditReportFields[] | undefined,
  useAbsoluteUrls?: boolean
): UseGetTablePropsOptions<InternalAuditReportRegisterFields> => {
  const { t: at } = useTranslation('common', {
    keyPrefix: 'internalAuditReports',
  });
  const fields = useGetFieldConfig(useAbsoluteUrls);
  const labelledFields = useLabelledFields(records);

  return useMemo(
    () => ({
      customAttributeFormIds: ['internal_audit_report'],
      tableId: 'internalAuditReportRegister',
      data: labelledFields,
      entityLabel: at('entity'),
      emptyCollectionAction: <></>,
      preferencesStorageKey: 'InternalAuditReportRegister-Preferences',
      enableFiltering: true,
      initialColumns: [
        'Title',
        'StartDate',
        'ActualCompletionDate',
        'StatusLabelled',
        'allOwners',
      ],
      fields,
    }),
    [at, fields, labelledFields]
  );
};

export const useGetCollectionTableProps = (
  records: InternalAuditReportFields[] | undefined
): TablePropsWithActions<InternalAuditReportRegisterFields> => {
  const props = useGetProps(records);

  return useGetTableProps(props);
};

export const useGetAssessmentSmartWidgetTableProps = (
  records: InternalAuditReportFields[] | undefined,
  statefulTableOptions: StatefulTableOptions<InternalAuditReportRegisterFields>
): TablePropsWithActions<InternalAuditReportRegisterFields> => {
  const props = useGetProps(records, true);

  return useGetStatelessTableProps<InternalAuditReportRegisterFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
