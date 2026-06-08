import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_COL_WIDTH } from 'src/App.config';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import IssuesStatusBadge from '@/components/issues-status-badge/IssuesStatusBadge';
import Link from '@/components/link';
import { EMPTY_CELL } from '@/utils/collectionUtils';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';
import { roundToTwoDecimals } from '@/utils/numberUtils';
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
import { exportStyleFromOption } from '@/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { yesNoCell } from '@/utils/table/utils/yesNoCell';

import type { IssueFlatField, IssueRegisterFields } from './types';
import { useLabelledFields } from './useLabelledFields';

export const useGetFieldConfig = (
  issueType: ParentIssueType
): TableFields<IssueRegisterFields> => {
  const issueMapping = IssueTypeMapping[issueType];
  const assessmentType = issueMapping.assessmentType;
  const allOwners = useGetOwnersFieldConfig<IssueRegisterFields>({
    formId: issueType,
    fieldId: 'Owners',
  });
  const allContributors = useGetContributorsFieldConfig<IssueRegisterFields>({
    formId: issueType,
    fieldId: 'Contributors',
  });
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: `${issueMapping.taxonomy}.columns`,
  });
  const { t: ft } = useTranslation(['common'], {
    keyPrefix: `${issueMapping.taxonomy}.footerLabels`,
  });
  const { t: gt } = useTranslation(['common']);
  const severity = useRating('severity');
  const { getByValue: getIssueStatus } = useRating('issue_assessment_status');

  const getDepartments = useCallback(
    (r: IssueRegisterFields) => r.departments,
    []
  );

  const departmentField = useGetDepartmentFieldConfig<IssueRegisterFields>(
    getDepartments,
    { formId: issueType, fieldId: 'departments' }
  );

  const getAssessmentDepartments = useCallback(
    (r: IssueRegisterFields) => r.AssessmentDepartments ?? [],
    []
  );
  const assessmentDepartmentsField =
    useGetDepartmentFieldConfig<IssueRegisterFields>(getAssessmentDepartments, {
      formId: assessmentType,
      fieldId: 'departments',
    });
  const tagField = useGetTagFieldConfig<IssueRegisterFields>({
    formId: issueType,
    fieldId: 'tags',
  });

  const getAssociations = useCallback(
    (r: IssueRegisterFields) => r.ParentTitle ?? [],
    []
  );

  const associations = useLinkArrayField<IssueRegisterFields>(
    t('associations'),
    getAssociations
  );

  return useMemo<TableFields<IssueRegisterFields>>(
    () => ({
      SequentialIdLabel: { header: t('id'), sortingField: 'SequentialId' },
      Title: {
        custom: false,
        formId: issueType,
        fieldId: 'Title',
        cell: (item) => {
          return (
            <Link
              variant={'secondary'}
              href={`/${issueMapping.uriPath}/${item.Id}`}
            >
              {item.Title}
            </Link>
          );
        },
        isRowHeader: true,
      },
      allOwners,
      allContributors,
      IssueTypeLabelled: {
        custom: false,
        formId: assessmentType,
        fieldId: 'IssueType',
        includeFromTypePostfix: true,
      },
      ParentTitle: associations,
      SeverityLabelled: {
        custom: false,
        formId: assessmentType,
        includeFromTypePostfix: true,
        fieldId: 'Severity',
        cell: (item) => {
          const rating = severity.getByValue(item.Severity);

          return rating ? (
            <SimpleRatingBadge rating={rating}>
              {item.SeverityLabelled}
            </SimpleRatingBadge>
          ) : (
            EMPTY_CELL
          );
        },
        exportCellStyle: exportStyleFromOption((item) =>
          severity.getByValue(item.Severity)
        ),
      },
      OpenActions: {
        header: st('open_actions'),
      },
      StatusLabelled: {
        custom: false,
        formId: assessmentType,
        includeFromTypePostfix: true,
        fieldId: 'Status',
        cell: (item) => (
          <IssuesStatusBadge
            item={{
              Status: item.assessment?.Status,
              TargetCloseDate: item.assessment?.TargetCloseDate,
            }}
          />
        ),
        exportCellStyle: exportStyleFromOption((item) =>
          getIssueStatus(item.assessment?.Status)
        ),
      },
      RaisedAtTimestamp: dateColumnFromConfig({
        header: { header: st('raised') },
        dateField: 'RaisedAtTimestamp',
      }),
      CreatedAtTimestamp: dateColumnFromConfig({
        header: { header: st('createdOn') },
        dateField: 'CreatedAtTimestamp',
      }),
      DateIdentified: dateColumnFromConfig({
        header: { formId: issueType, fieldId: 'DateIdentified' },
        dateField: 'DateIdentified',
      }),
      TargetCloseDate: dateColumnFromConfig({
        header: {
          formId: assessmentType,
          fieldId: 'TargetCloseDate',
          includeFromTypePostfix: true,
        },
        dateField: 'TargetCloseDate',
      }),
      tags: tagField,
      departments: departmentField,
      ActualCloseDate: dateColumnFromConfig({
        header: {
          formId: assessmentType,
          fieldId: 'ActualCloseDate',
          includeFromTypePostfix: true,
        },
        dateField: 'ActualCloseDate',
      }),
      AssessmentDepartments: {
        ...assessmentDepartmentsField,
        formId: assessmentType,
        fieldId: 'departments',
        includeFromTypePostfix: true,
      },
      CertifiedIndividual: {
        custom: false,
        formId: assessmentType,
        fieldId: 'CertifiedIndividual',
        includeFromTypePostfix: true,
      },
      DateOccurred: dateColumnFromConfig({
        header: { formId: issueType, fieldId: 'DateOccurred' },
        dateField: 'DateOccurred',
      }),
      Details: { custom: false, formId: issueType, fieldId: 'Details' },
      ImpactsCustomer: {
        custom: false,
        formId: issueType,
        fieldId: 'ImpactsCustomer',
        cell: yesNoCell('ImpactsCustomer'),
      },
      IsExternalIssue: {
        header: st('is_external_issue'),
        cell: yesNoCell('IsExternalIssue'),
      },

      InternalOrExternalIssue: {
        custom: false,
        formId: issueType,
        fieldId: 'IsExternalIssue',
      },
      IssueCausedBySystemIssue: {
        formId: assessmentType,
        fieldId: 'IssueCausedBySystemIssue',
        custom: false,
        cell: yesNoCell('IssueCausedBySystemIssue'),
        includeFromTypePostfix: true,
      },

      SystemResponsible: {
        formId: assessmentType,
        fieldId: 'SystemResponsible',
        custom: false,
        includeFromTypePostfix: true,
      },
      IssueCausedByThirdParty: {
        formId: assessmentType,
        fieldId: 'IssueCausedByThirdParty',
        custom: false,
        cell: yesNoCell('IssueCausedByThirdParty'),
        includeFromTypePostfix: true,
      },
      ThirdPartyResponsible: {
        formId: assessmentType,
        fieldId: 'ThirdPartyResponsible',
        custom: false,
        includeFromTypePostfix: true,
      },
      PolicyBreach: {
        custom: false,
        formId: assessmentType,
        fieldId: 'PolicyBreach',
        cell: yesNoCell('PolicyBreach'),
        includeFromTypePostfix: true,
      },
      PoliciesBreached: {
        custom: false,
        formId: assessmentType,
        fieldId: 'PoliciesBreached',
        includeFromTypePostfix: true,
      },
      PolicyOwner: {
        custom: false,
        formId: assessmentType,
        fieldId: 'PolicyOwner',
        includeFromTypePostfix: true,
      },
      PolicyOwnerCommentary: {
        custom: false,
        formId: assessmentType,
        fieldId: 'PolicyOwnerCommentary',
        maxWidth: MAX_COL_WIDTH,
        includeFromTypePostfix: true,
      },
      Rationale: {
        custom: false,
        formId: assessmentType,
        fieldId: 'Rationale',
        includeFromTypePostfix: true,
      },
      Reportable: {
        custom: false,
        formId: assessmentType,
        fieldId: 'Reportable',
        cell: yesNoCell('RegulatoryBreach'),
        includeFromTypePostfix: true,
      },
      RegulatoryBreach: {
        custom: false,
        formId: assessmentType,
        fieldId: 'RegulatoryBreach',
        cell: yesNoCell('RegulatoryBreach'),
        includeFromTypePostfix: true,
      },
      RegulationsBreached: {
        custom: false,
        formId: assessmentType,
        fieldId: 'RegulationsBreached',
        includeFromTypePostfix: true,
      },
      ModifiedAtTimestamp: dateColumnFromConfig({
        header: { header: t('updated_on') },
        dateField: 'ModifiedAtTimestamp',
      }),
      ModifiedByUser: { header: t('updated_by_id') },
      ModifiedByUserName: { header: st('modified_by_username') },
      CreatedByUserName: { header: st('created_by_username') },
      AssessmentCreatedBy: { header: st('assessment_created_by_username') },
      AssessmentModifiedBy: {
        header: st('assessment_modified_by_username'),
      },
      ParentId: { header: st('parent_id') },
      Hours: {
        filterOptions: {
          filteringProperties: {
            operators: ['!=', '>', '<', '>=', '<='],
          },
        },
        header: st('hours'),
        footerVal: (items) => {
          const total = items.reduce(
            (previous, current) => previous + current.Hours,
            0
          );

          // Round to 2 decimal places to handle floating point precision issues
          return roundToTwoDecimals(total);
        },
        footerLabel: ft('hours'),
      },
      Cost: {
        filterOptions: {
          filteringProperties: {
            operators: ['!=', '>', '<', '>=', '<='],
          },
        },
        header: st('cost'),
        footerVal: (items) => {
          const total = items.reduce(
            (previous, current) => previous + current.Cost,
            0
          );

          // Round to 2 decimal places to handle floating point precision issues
          return roundToTwoDecimals(total);
        },
        footerLabel: ft('cost'),
      },
      CustomersImpacted: {
        filterOptions: {
          filteringProperties: {
            operators: ['!=', '>', '<', '>=', '<='],
          },
        },
        header: st('customers_impacted'),
        footerVal: (items) => {
          const total = items.reduce(
            (previous, current) => previous + current.CustomersImpacted,
            0
          );

          // Round to 2 decimal places to handle floating point precision issues
          return roundToTwoDecimals(total);
        },
        footerLabel: ft('customers_impacted'),
      },
      TimeToResolve: {
        header: st('time_to_resolve'),
        cell: (item) =>
          _.isNil(item.TimeToResolve)
            ? EMPTY_CELL
            : gt('units.day', { count: item.TimeToResolve }),
      },
      TimeToReport: {
        header: st('time_to_report'),
        cell: (item) =>
          _.isNil(item.TimeToReport)
            ? EMPTY_CELL
            : gt('units.day', { count: item.TimeToReport }),
      },
      TimeToIdentify: {
        header: st('time_to_identify'),
        cell: (item) =>
          _.isNil(item.TimeToIdentify)
            ? EMPTY_CELL
            : gt('units.day', { count: item.TimeToIdentify }),
      },
      TimeSinceCreated: {
        header: st('time_since_created'),
        cell: (item) =>
          _.isNil(item.TimeSinceCreated)
            ? EMPTY_CELL
            : gt('units.day', { count: item.TimeSinceCreated }),
      },
      Id: {
        header: t('guid'),
      },
      UpdateCount: { header: st('updateCount') },
      LatestUpdateCreatedAtTimestamp: dateColumnFromConfig({
        header: { header: st('latestUpdateCreatedAtTimestamp') },
        dateField: 'LatestUpdateCreatedAtTimestamp',
      }),
      LatestUpdateDescription: { header: st('latestUpdateDescription') },
      LatestUpdateTitle: { header: st('latestUpdateTitle') },
    }),
    [
      allContributors,
      allOwners,
      assessmentDepartmentsField,
      associations,
      departmentField,
      getIssueStatus,
      ft,
      gt,
      severity,
      st,
      t,
      tagField,
      issueMapping,
      issueType,
      assessmentType,
    ]
  );
};

const useGetIssueTableProps = (
  issueType: ParentIssueType,
  records: IssueFlatField[] | undefined
): UseGetTablePropsOptions<IssueRegisterFields> => {
  const issueTypeMapping = IssueTypeMapping[issueType];
  const { t } = useTranslation(['common']);
  const data = useLabelledFields(issueType, records);
  const fields = useGetFieldConfig(issueType);

  return useMemo(() => {
    return {
      tableId: `${issueType}Register`,
      data,
      customAttributeFormIds: [issueType, issueTypeMapping.assessmentType],
      entityLabel: t(issueTypeMapping.entityLabel),
      emptyCollectionAction: <></>,
      preferencesStorageKey: issueTypeMapping.issueRegisterStorageKey,
      enableFiltering: true,
      initialColumns: [
        'Title',
        'allOwners',
        'ParentTitle',
        'IssueTypeLabelled',
        'SeverityLabelled',
        'OpenActions',
        'StatusLabelled',
        'RaisedAtTimestamp',
        'TargetCloseDate',
        'tags',
      ],
      fields,
    };
  }, [data, fields, t, issueTypeMapping, issueType]);
};

export const useGetRegisterTableProps = (
  issueType: ParentIssueType,
  records: IssueFlatField[] | undefined,
  loading?: boolean
): TablePropsWithActions<IssueRegisterFields> => {
  const props = useGetIssueTableProps(issueType, records);

  return useGetTableProps({ ...props, enableFiltering: !loading });
};

export const useGetStatelessRegisterTableProps = (
  issueType: ParentIssueType,
  records: IssueFlatField[] | undefined,
  loading?: boolean
): TablePropsWithActions<IssueRegisterFields> => {
  const props = useGetIssueTableProps(issueType, records);

  return useGetTablePropsWithoutUrlHash({
    ...props,
    enableFiltering: !loading,
  });
};

export const useGetIssueSmartWidgetTableProps = (
  issueType: ParentIssueType,
  records: IssueFlatField[] | undefined,
  statefulTableOptions: StatefulTableOptions<IssueRegisterFields>
): TablePropsWithActions<IssueRegisterFields> => {
  const props = useGetIssueTableProps(issueType, records);

  return useGetStatelessTableProps<IssueRegisterFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
