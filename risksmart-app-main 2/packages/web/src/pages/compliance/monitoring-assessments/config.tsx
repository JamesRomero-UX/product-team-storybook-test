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
import { exportStyleFromValue } from '@/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { complianceMonitoringAssessmentDetailsUrl } from '@/utils/urls';

import type {
  ComplianceMonitoringAssessmentFields,
  ComplianceMonitoringAssessmentRegisterFields,
} from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (
  useAbsoluteUrls?: boolean
): TableFields<ComplianceMonitoringAssessmentRegisterFields> => {
  const { t } = useTranslation('common', {
    keyPrefix: `complianceMonitoringAssessment.columns`,
  });
  const allOwners =
    useGetOwnersFieldConfig<ComplianceMonitoringAssessmentRegisterFields>({
      formId: 'compliance_monitoring_assessment',
      fieldId: 'Owners',
    });
  const allContributors =
    useGetContributorsFieldConfig<ComplianceMonitoringAssessmentRegisterFields>(
      {
        formId: 'compliance_monitoring_assessment',
        fieldId: 'Contributors',
      }
    );
  const { getByValue: statusGetByValue } = useRating('assessment_status');
  const { getByValue: outcomeGetByValue } = useRating(
    'compliance_monitoring_assessment_outcome'
  );
  const tagField =
    useGetTagFieldConfig<ComplianceMonitoringAssessmentRegisterFields>({
      formId: 'compliance_monitoring_assessment',
      fieldId: 'tags',
    });
  const departmentField =
    useGetDepartmentFieldConfig<ComplianceMonitoringAssessmentRegisterFields>(
      (r) => r.departments,
      {
        formId: 'compliance_monitoring_assessment',
        fieldId: 'departments',
      }
    );
  const { t: gt } = useTranslation(['common'], { keyPrefix: 'columns' });

  return useMemo(
    () => ({
      Title: {
        custom: false,
        formId: 'compliance_monitoring_assessment',
        fieldId: 'Title',
        cell: (item) => {
          return (
            <Link
              isRelativeUrl={!useAbsoluteUrls}
              variant={'secondary'}
              href={
                useAbsoluteUrls
                  ? complianceMonitoringAssessmentDetailsUrl(item.Id)
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
        header: {
          formId: 'compliance_monitoring_assessment',
          fieldId: 'StartDate',
        },
        dateField: 'StartDate',
      }),
      ActualCompletionDate: dateColumnFromConfig({
        header: {
          formId: 'compliance_monitoring_assessment',
          fieldId: 'ActualCompletionDate',
        },
        dateField: 'ActualCompletionDate',
      }),
      StatusLabelled: {
        custom: false,
        formId: 'compliance_monitoring_assessment',
        fieldId: 'Status',
        cell: (item) => (
          <SimpleRatingBadge rating={statusGetByValue(item.Status)} />
        ),
        // Provide PDF export cell styling (badge background + accessible text)
        exportCellStyle: exportStyleFromValue(
          (item) => item.Status,
          (v) => statusGetByValue(v)
        ),
      },
      OutcomeLabelled: {
        custom: false,
        formId: 'compliance_monitoring_assessment',
        fieldId: 'Outcome',
        cell: (item) => (
          <SimpleRatingBadge rating={outcomeGetByValue(item.Outcome)} />
        ),
        // Provide PDF export cell styling (badge background + accessible text)
        exportCellStyle: exportStyleFromValue(
          (item) => item.Outcome,
          (v) => outcomeGetByValue(v)
        ),
      },
      AssessedItems: {
        header: t('AssessedItems'),
      },
      TargetCompletionDate: dateColumnFromConfig({
        header: {
          formId: 'compliance_monitoring_assessment',
          fieldId: 'TargetCompletionDate',
        },
        dateField: 'TargetCompletionDate',
      }),
      completedByUser: {
        custom: false,
        formId: 'compliance_monitoring_assessment',
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
        header: {
          formId: 'compliance_monitoring_assessment',
          fieldId: 'NextTestDate',
        },
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
  records: ComplianceMonitoringAssessmentFields[] | undefined,
  useAbsoluteUrls?: boolean
): UseGetTablePropsOptions<ComplianceMonitoringAssessmentRegisterFields> => {
  const { t: at } = useTranslation('common', {
    keyPrefix: 'complianceMonitoringAssessment',
  });
  const fields = useGetFieldConfig(useAbsoluteUrls);
  const labelledFields = useLabelledFields(records);

  return useMemo(
    () => ({
      customAttributeFormIds: ['compliance_monitoring_assessment'],
      tableId: 'complianceMonitoringAssessmentRegister',
      data: labelledFields,
      entityLabel: at('entity'),
      emptyCollectionAction: <></>,
      preferencesStorageKey:
        'ComplianceMonitoringAssessmentRegister-Preferences',
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
  records: ComplianceMonitoringAssessmentFields[] | undefined
): TablePropsWithActions<ComplianceMonitoringAssessmentRegisterFields> => {
  const props = useGetProps(records);

  return useGetTableProps(props);
};

export const useGetAssessmentSmartWidgetTableProps = (
  records: ComplianceMonitoringAssessmentFields[] | undefined,
  statefulTableOptions: StatefulTableOptions<ComplianceMonitoringAssessmentRegisterFields>
): TablePropsWithActions<ComplianceMonitoringAssessmentRegisterFields> => {
  const props = useGetProps(records, true);

  return useGetStatelessTableProps<ComplianceMonitoringAssessmentRegisterFields>(
    {
      ...props,
      ...statefulTableOptions,
      enableFiltering: false,
    }
  );
};
