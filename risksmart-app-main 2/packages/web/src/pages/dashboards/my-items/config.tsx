import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import type {
  Action_Status_Enum,
  GetMyDueItemsQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { useGetChangeRequestParentUrl } from 'src/pages/requests/config';

import ActionsStatusBadge from '@/components/action-status-badge/ActionsStatusBadge';
import Link from '@/components/link';
import { useChangeRequests } from '@/hooks/useChangeRequests';
import { getFriendlyId } from '@/utils/friendlyId';
import type {
  StatefulTableOptions,
  UseGetTablePropsOptions,
} from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetStatelessTableProps } from '@/utils/table/hooks/useGetStatelessTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import {
  actionDetailsUrl,
  assessmentDetailsUrl,
  controlDetailsUrl,
  indicatorDetailsUrl,
  issueDetailsUrl,
  obligationDetailsUrl,
  policyDetailsUrl,
  publicPolicyFileUrl,
  riskDetailsUrl,
} from '@/utils/urls';

import { useDashboardStore } from '../useDashboardStore';

export type MyOverdueItemFields = {
  Id: string | undefined;
  Title: string | undefined;
  Type: string;
  DateDue: null | string;
  Status: number | string;
  url: string;
};

interface GetTypes {
  request: string;
  action: string;
  risk: string;
  indicator: string;
  indicatorTest: string;
  document: string;
  assessment: string;
  control: string;
  issue: string;
  attestation: string;
  RCSAActivity: string;
  documentReview: string;
  obligationReview: string;
}

const useGetFieldConfig = (): TableFields<MyOverdueItemFields> => {
  const types = useGetTypes();
  const approvalRatings = useRating('approval_status');
  const assessmentRatings = useRating('assessment_status');
  const attestationRatings = useRating('attestation_record_status');
  const activityRatings = useRating('assessment_activity_status');

  return {
    Title: {
      header: 'Title',
      cell: (item) => (
        <Link variant={'secondary'} href={item.url}>
          {item.Title}
        </Link>
      ),
      isRowHeader: true,
    },
    Type: {
      header: 'Type',
    },
    DateDue: dateColumnFromConfig({
      header: { header: 'Due Date' },
      dateField: 'DateDue',
    }),
    Status: {
      header: 'Status',
      cell: (item) => {
        switch (item.Type) {
          case types.request:
            return (
              <SimpleRatingBadge
                rating={approvalRatings.getByValue(item.Status)}
              />
            );
          case types.assessment:
            return (
              <SimpleRatingBadge
                rating={assessmentRatings.getByValue(item.Status)}
              />
            );
          case types.attestation:
            return (
              <SimpleRatingBadge
                rating={attestationRatings.getByValue(item.Status)}
              />
            );
          case types.RCSAActivity:
            return (
              <SimpleRatingBadge
                rating={activityRatings.getByValue(item.Status)}
              />
            );
          case types.action:
          case types.control:
          case types.indicatorTest:
          case types.issue:
          case types.risk:
          case types.documentReview:
          case types.obligationReview:
            return (
              <ActionsStatusBadge
                item={{
                  Status: item.Status as Action_Status_Enum,
                  DateDue: item.DateDue ?? '',
                }}
              />
            );
          default:
            return <></>;
        }
      },
    },
  };
};

const useGetTypes = (): GetTypes => {
  const { t, i18n } = useTranslation(['taxonomy']);
  const { t: tc } = useTranslation('common');

  return {
    request: i18n.format(t('request_one'), 'capitalizeAll'),
    action: i18n.format(t('action_one'), 'capitalizeAll'),
    risk: i18n.format(t('risk_one'), 'capitalizeAll'),
    indicator: i18n.format(t('indicator_one'), 'capitalizeAll'),
    indicatorTest: tc('indicatorTest'),
    assessment: i18n.format(t('assessment_one'), 'capitalizeAll'),
    document: i18n.format(t('document_one'), 'capitalizeAll'),
    control: i18n.format(t('control_one'), 'capitalizeAll'),
    issue: i18n.format(t('issue_one'), 'capitalizeAll'),
    attestation: i18n.format(t('attestation_one'), 'capitalizeAll'),
    RCSAActivity: tc('assessmentActivities.rcsa'),
    documentReview: tc('documentReview'),
    obligationReview: tc('obligationReview'),
  };
};

const getChangeRequestTitle = (
  requestParent: GetMyDueItemsQuery['change_request'][0]['parent']
): string | undefined => {
  switch (requestParent?.ObjectType) {
    case ParentTypes.DocumentFile:
      return `${requestParent?.documentFile?.parent?.Title} (${requestParent?.documentFile?.Version})`;
    case ParentTypes.Acceptance:
      return requestParent?.acceptance?.Title;
    case ParentTypes.Risk:
      return requestParent?.risk?.Title;
    case ParentTypes.Control:
      return requestParent?.control?.Title;
    case ParentTypes.Action:
      return requestParent?.action?.Title;
    case ParentTypes.IssueAssessment:
      return requestParent?.issue_assessment?.parent?.Title;
    default:
      return requestParent
        ? getFriendlyId(requestParent.ObjectType, requestParent.SequentialId)
        : 'Deleted Item';
  }
};

const useFlattenData = (
  data: GetMyDueItemsQuery | undefined
): MyOverdueItemFields[] | undefined => {
  const types = useGetTypes();
  const actionRatings = useRating('action_status');
  const getChangeRequestParentUrl = useGetChangeRequestParentUrl();
  const {
    myItemsFilters: { owner },
  } = useDashboardStore();
  const { isActiveApprover } = useChangeRequests();
  const indicatorData = (data as { indicator?: GetMyDueItemsQuery['document'] })
    ?.indicator;

  return useMemo<MyOverdueItemFields[] | undefined>(() => {
    // Only show CRs and attestation records if the owner filter is set
    const requests = owner
      ? data?.change_request
          ?.filter((cr) =>
            isActiveApprover(
              cr,
              cr.currentUserOwnerList?.map((u) => u.UserId ?? '')
            )
          )
          .map((d) => ({
            Id: d.parent?.Id,
            Title: getChangeRequestTitle(d.parent),
            Type: types.request,
            DateDue: d.CreatedAtTimestamp,
            Status: 'overdue',
            url: `${getChangeRequestParentUrl(d)}?showRequest=true&requestId=${d.Id}`,
          }))
      : [];

    const attestations = owner
      ? data?.attestation_record?.map((d) => ({
          Id: d.node.documentFile?.parent?.Id,
          Title: d.node.documentFile?.parent?.Title,
          Type: types.attestation,
          DateDue: d.ExpiresAt ?? '',
          Status: d.AttestationStatus,
          url: publicPolicyFileUrl(
            d.node.documentFile?.parent?.Id ?? '',
            'latest'
          ),
        }))
      : [];

    const risks = data?.risk
      // remove risks that are already linked to an assessment activity as this takes priority
      .filter((d) => !data.assessment_activity.some((a) => a.RiskId === d.Id))
      ?.map((d) => ({
        Id: d.Id,
        Title: d.Title,
        Type: types.risk,
        DateDue: d.scheduleState?.DueDate ?? '',
        Status: dayjs(d.scheduleState?.OverdueDate).isBefore(dayjs())
          ? (actionRatings.getByValue('overdue')?.value ?? '')
          : (actionRatings.getByValue('pending')?.value ?? ''),
        url: riskDetailsUrl(d.Id),
      }));

    const actions = data?.action?.map((d) => {
      return {
        Id: d.Id,
        Title: d.Title,
        Type: types.action,
        DateDue: d.DateDue,
        Status: d.Status,
        url: actionDetailsUrl(d.Id),
      };
    });

    const assessments = data?.assessment?.map((d) => ({
      Id: d.Id,
      Title: d.Title,
      Type: types.assessment,
      DateDue: d.TargetCompletionDate ?? '',
      Status: d.Status,
      url: assessmentDetailsUrl(d.Id),
    }));

    const controls = data?.control?.map((d) => ({
      Id: d.Id,
      Title: d.Title,
      Type: types.control,
      DateDue: d.scheduleState?.DueDate ?? '',
      Status: dayjs(d.scheduleState?.OverdueDate).isBefore(dayjs())
        ? (actionRatings.getByValue('overdue')?.value ?? '')
        : (actionRatings.getByValue('pending')?.value ?? ''),
      url: controlDetailsUrl(d.Id),
    }));

    const issues = data?.issue?.map((d) => ({
      Id: d.Id,
      Title: d.Title,
      Type: types.issue,
      DateDue: d.assessment?.TargetCloseDate ?? '',
      Status: dayjs(d.assessment?.TargetCloseDate)
        .add(1, 'day')
        .isBefore(dayjs())
        ? (actionRatings.getByValue('overdue')?.value ?? '')
        : (actionRatings.getByValue('pending')?.value ?? ''),
      url: issueDetailsUrl(d.Id),
    }));

    const rcsaActivities = data?.assessment_activity?.map((d) => ({
      Id: d.Id,
      Title: d.Title!,
      Type: types.RCSAActivity,
      DateDue: d.parentRisk?.scheduleState?.DueDate ?? '',
      Status: d.Status!,
      url: riskDetailsUrl(d.RiskId!),
    }));

    const documents = data?.document?.map((d) => ({
      Id: d.Id,
      Title: d.Title,
      Type: types.documentReview,
      DateDue: d.scheduleState?.DueDate ?? '',
      Status: dayjs(d.scheduleState?.OverdueDate).isBefore(dayjs())
        ? (actionRatings.getByValue('overdue')?.value ?? '')
        : (actionRatings.getByValue('pending')?.value ?? ''),
      url: policyDetailsUrl(d.Id),
    }));

    const indicators = (indicatorData ?? []).map((d) => ({
      Id: d.Id,
      Title: d.Title,
      Type: types.indicatorTest,
      DateDue: d.scheduleState?.DueDate ?? '',
      Status: dayjs(d.scheduleState?.OverdueDate).isBefore(dayjs())
        ? (actionRatings.getByValue('overdue')?.value ?? '')
        : (actionRatings.getByValue('pending')?.value ?? ''),
      url: indicatorDetailsUrl(d.Id),
    }));

    const obligations = data?.obligation?.map((d) => ({
      Id: d.Id,
      Title: d.Title,
      Type: types.obligationReview,
      DateDue: d.scheduleState?.DueDate ?? '',
      Status: dayjs(d.scheduleState?.OverdueDate).isBefore(dayjs())
        ? (actionRatings.getByValue('overdue')?.value ?? '')
        : (actionRatings.getByValue('pending')?.value ?? ''),
      url: obligationDetailsUrl(d.Id),
    }));

    return [
      ...(risks ?? []),
      ...(requests ?? []),
      ...(actions ?? []),
      ...(assessments ?? []),
      ...(attestations ?? []),
      ...(controls ?? []),
      ...(issues ?? []),
      ...(rcsaActivities ?? []),
      ...(documents ?? []),
      ...indicators,
      ...(obligations ?? []),
    ];
  }, [
    owner,
    data?.change_request,
    data?.attestation_record,
    data?.risk,
    data?.action,
    data?.assessment,
    data?.control,
    indicatorData,
    data?.issue,
    data?.assessment_activity,
    data?.document,
    data?.obligation,
    isActiveApprover,
    types.request,
    types.attestation,
    types.risk,
    types.action,
    types.assessment,
    types.control,
    types.issue,
    types.RCSAActivity,
    types.indicatorTest,
    types.documentReview,
    types.obligationReview,
    getChangeRequestParentUrl,
    actionRatings,
  ]);
};

export const useGetMyOverdueItemsTableProps = (
  data: GetMyDueItemsQuery | undefined,
  tableId: string = 'myOverdueItems'
) => {
  const labelledFields = useFlattenData(data);
  const fields = useGetFieldConfig();
  const { t } = useTranslation('common', {
    keyPrefix: 'dashboard.myItemsDashboard',
  });

  return useMemo<UseGetTablePropsOptions<MyOverdueItemFields>>(
    () => ({
      fields,
      tableId,
      data: labelledFields,
      entityLabel: t('entity_name'),
      customAttributeFormIds: [],
    }),
    [fields, labelledFields, t, tableId]
  );
};

export const useGetMyOverdueItemsSmartWidgetTableProps = (
  data: GetMyDueItemsQuery | undefined,
  statefulTableOptions: StatefulTableOptions<MyOverdueItemFields>
): TablePropsWithActions<MyOverdueItemFields> => {
  const props = useGetMyOverdueItemsTableProps(data);

  return useGetStatelessTableProps<MyOverdueItemFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
