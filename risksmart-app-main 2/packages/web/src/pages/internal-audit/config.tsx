import { useInternalAuditRating } from '@risksmart-app/components/src/hooks/useRating';
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
import { internalAuditDetailsUrl } from '@/utils/urls';

import { MAX_COL_WIDTH } from '../../App.config';
import type { InternalAuditFields, InternalAuditRegisterFields } from './types';
import { useLabelledFields } from './useLabelledFields';

export const useGetFieldConfig =
  (): TableFields<InternalAuditRegisterFields> => {
    const { t } = useTranslation('common', {
      keyPrefix: `internalAudits.columns`,
    });
    const allOwners = useGetOwnersFieldConfig<InternalAuditRegisterFields>({
      formId: 'internal_audit_entity',
      fieldId: 'Owners',
    });
    const allContributors =
      useGetContributorsFieldConfig<InternalAuditRegisterFields>({
        formId: 'internal_audit_entity',
        fieldId: 'Contributors',
      });
    const tagField = useGetTagFieldConfig<InternalAuditRegisterFields>({
      formId: 'internal_audit_entity',
      fieldId: 'tags',
    });
    const departmentField =
      useGetDepartmentFieldConfig<InternalAuditRegisterFields>(
        (r) => r.departments,
        {
          formId: 'internal_audit_entity',
          fieldId: 'departments',
        }
      );
    const { t: gt } = useTranslation(['common'], { keyPrefix: 'columns' });
    const { getByValue: statusGetByValue } = useInternalAuditRating(
      'internal_audit_entity_status'
    );
    const { getByValue: getOutcomeLabel } = useInternalAuditRating(
      'internal_audit_report_outcome'
    );

    return {
      Title: {
        formId: 'internal_audit_entity',
        fieldId: 'Title',
        cell: (item) => {
          return (
            <Link variant={'secondary'} href={internalAuditDetailsUrl(item.Id)}>
              {item.Title}
            </Link>
          );
        },
        isRowHeader: true,
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
      BusinessArea: {
        formId: 'internal_audit_entity',
        fieldId: 'BusinessArea',
      },
      ModifiedAtTimestamp: dateColumnFromConfig({
        header: { header: t('updated_on') },
        dateField: 'ModifiedAtTimestamp',
      }),
      CreatedByUser: {
        header: t('created_by_id'),
      },
      UserName: {
        header: t('created_by_username'),
      },
      ReportStatusLabelled: {
        header: t('ReportStatusLabelled'),
        sortingField: 'ReportStatusLabelled',
        cell: (item) => {
          return (
            <SimpleRatingBadge rating={statusGetByValue(item.ReportStatus)} />
          );
        },
        maxWidth: MAX_COL_WIDTH,
        isRowHeader: true,
      },
      AuditRatingLabelled: {
        header: t('AuditRatingLabelled'),
        sortingField: 'AuditRatingLabelled',
        cell: (item) => {
          return (
            <SimpleRatingBadge rating={getOutcomeLabel(item.AuditRating)} />
          );
        },
      },
      OpenActionCount: {
        header: t('OpenActionCount'),
      },
      OpenIssueCount: {
        header: t('OpenIssueCount'),
      },
      LatestReportDate: dateColumnFromConfig({
        header: { header: t('LatestReportDate') },
        dateField: 'LatestReportDate',
      }),
      allOwners,
      allContributors,
      tags: tagField,
      departments: departmentField,
    };
  };

const useGetInternalAuditsTableProps = (
  records: InternalAuditFields[] | undefined
): UseGetTablePropsOptions<InternalAuditRegisterFields> => {
  const { t: at } = useTranslation('common', { keyPrefix: 'internalAudits' });
  const fields = useGetFieldConfig();
  const labelledFields = useLabelledFields(records);

  return {
    tableId: 'internalAuditRegister',
    data: labelledFields,
    customAttributeFormIds: ['internal_audit_entity'],
    entityLabel: at('entity'),
    emptyCollectionAction: <></>,
    preferencesStorageKey: 'InternalAuditRegister-Preferences',
    enableFiltering: true,
    initialColumns: [
      'Title',
      'BusinessArea',
      'LatestReportDate',
      'ReportStatusLabelled',
      'AuditRatingLabelled',
      'OpenActionCount',
      'OpenIssueCount',
      'allOwners',
    ],
    fields,
  };
};

export const useGetCollectionTableProps = (
  records: InternalAuditFields[] | undefined
): TablePropsWithActions<InternalAuditRegisterFields> => {
  const props = useGetInternalAuditsTableProps(records);

  return useGetTableProps(props);
};

export const useGetInternalAuditsSmartWidgetTableProps = (
  records: InternalAuditFields[] | undefined,
  statefulTableOptions: StatefulTableOptions<InternalAuditRegisterFields>
): TablePropsWithActions<InternalAuditRegisterFields> => {
  const props = useGetInternalAuditsTableProps(records);

  return useGetStatelessTableProps<InternalAuditRegisterFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
