import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
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
import { assessmentDetailsUrl } from '@/utils/urls';

import type { AssessmentFields, AssessmentRegisterFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (
  useAbsoluteUrls?: boolean
): TableFields<AssessmentRegisterFields> => {
  const { t } = useTranslation('common', {
    keyPrefix: `assessments.columns`,
  });
  const allOwners = useGetOwnersFieldConfig<AssessmentRegisterFields>({
    formId: Parent_Type_Enum.Assessment,
    fieldId: 'Owners',
  });
  const allContributors =
    useGetContributorsFieldConfig<AssessmentRegisterFields>({
      formId: Parent_Type_Enum.Assessment,
      fieldId: 'Contributors',
    });
  const { getByValue: statusGetByValue } = useRating('assessment_status');
  const { getByValue: outcomeGetByValue } = useRating('assessment_outcome');
  const tagField = useGetTagFieldConfig<AssessmentRegisterFields>({
    formId: Parent_Type_Enum.Assessment,
    fieldId: 'tags',
  });
  const departmentField = useGetDepartmentFieldConfig<AssessmentRegisterFields>(
    (r) => r.departments,
    {
      formId: Parent_Type_Enum.Assessment,
      fieldId: 'departments',
    }
  );
  const { t: gt } = useTranslation(['common'], { keyPrefix: 'columns' });

  return useMemo(
    () => ({
      Title: {
        custom: false,
        formId: Parent_Type_Enum.Assessment,
        fieldId: 'Title',
        cell: (item) => {
          return (
            <Link
              isRelativeUrl={!useAbsoluteUrls}
              variant={'secondary'}
              href={useAbsoluteUrls ? assessmentDetailsUrl(item.Id) : item.Id}
            >
              {item.Title}
            </Link>
          );
        },
        isRowHeader: true,
      },
      StartDate: dateColumnFromConfig({
        header: { formId: Parent_Type_Enum.Assessment, fieldId: 'StartDate' },
        dateField: 'StartDate',
      }),
      ActualCompletionDate: dateColumnFromConfig({
        header: {
          formId: Parent_Type_Enum.Assessment,
          fieldId: 'ActualCompletionDate',
        },
        dateField: 'ActualCompletionDate',
      }),
      StatusLabelled: {
        custom: false,
        formId: Parent_Type_Enum.Assessment,
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
        formId: Parent_Type_Enum.Assessment,
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
          formId: Parent_Type_Enum.Assessment,
          fieldId: 'TargetCompletionDate',
        },
        dateField: 'TargetCompletionDate',
      }),
      completedByUser: {
        custom: false,
        formId: Parent_Type_Enum.Assessment,
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
          formId: Parent_Type_Enum.Assessment,
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
  records: AssessmentFields[] | undefined,
  useAbsoluteUrls?: boolean
): UseGetTablePropsOptions<AssessmentRegisterFields> => {
  const { t: at } = useTranslation('common', { keyPrefix: 'assessments' });
  const fields = useGetFieldConfig(useAbsoluteUrls);
  const labelledFields = useLabelledFields(records);

  return useMemo(
    () => ({
      customAttributeFormIds: [Parent_Type_Enum.Assessment],
      tableId: 'assessmentRegister',
      data: labelledFields,
      entityLabel: at('entity'),
      emptyCollectionAction: <></>,
      preferencesStorageKey: 'AssessmentRegister-Preferences',
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
  records: AssessmentFields[] | undefined
): TablePropsWithActions<AssessmentRegisterFields> => {
  const props = useGetProps(records);

  return useGetTableProps(props);
};

export const useGetAssessmentSmartWidgetTableProps = (
  records: AssessmentFields[] | undefined,
  statefulTableOptions: StatefulTableOptions<AssessmentRegisterFields>
): TablePropsWithActions<AssessmentRegisterFields> => {
  const props = useGetProps(records, true);

  return useGetStatelessTableProps<AssessmentRegisterFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
