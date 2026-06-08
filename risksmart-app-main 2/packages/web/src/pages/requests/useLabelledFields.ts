import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { GetChangeRequestsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Approval_Status_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useChangeRequests } from '@/hooks/useChangeRequests';
import { getFriendlyId } from '@/utils/friendlyId';

import type { ChangeRequestRegisterFields } from './types';

export const useLabelledFields = (
  data?: GetChangeRequestsQuery
): ChangeRequestRegisterFields[] => {
  const { t } = useTranslation(['taxonomy', 'common']);
  const objectTypeMapping = t('common:objectTypes', {
    returnObjects: true,
  });
  const workflowMap = t('common:approvals.workflows', {
    returnObjects: true,
  });
  const {
    isActiveApprover,
    getCurrentLevel,
    getMaxLevel,
    getCurrentApprovers,
    getNextApprovers,
  } = useChangeRequests();
  const { getByValue } = useRating('approval_status');

  const getParentName = (item: GetChangeRequestsQuery['change_request'][0]) => {
    switch (item.parent?.ObjectType) {
      case 'document_file':
        return `${item.parent?.documentFile?.parent?.Title} (${item.parent?.documentFile?.Version})`;
      case 'acceptance':
        return item.parent?.acceptance?.Title;
      case 'risk':
        return item.parent?.risk?.Title;
      case 'control':
        return item.parent?.control?.Title;
      case 'action':
        return item.parent?.action?.Title;
      case 'issue_assessment':
        return item.parent?.issue_assessment?.parent?.Title;
      default:
        return item.parent
          ? getFriendlyId(item.parent.ObjectType, item.parent.SequentialId)
          : 'Deleted Item'; // TODO: Translation
    }
  };

  const getParentSequentialId = (
    item: GetChangeRequestsQuery['change_request'][0]
  ): string | null => {
    if (!item.parent) {
      return null;
    }

    switch (item.parent.ObjectType) {
      case 'document_file':
        return getFriendlyId(
          Parent_Type_Enum.Document,
          item.parent.documentFile?.parent?.SequentialId
        );
      case 'acceptance':
        return getFriendlyId(
          Parent_Type_Enum.Acceptance,
          item.parent.SequentialId
        );
      case 'risk':
        return getFriendlyId(Parent_Type_Enum.Risk, item.parent.SequentialId);
      case 'control':
        return getFriendlyId(
          Parent_Type_Enum.Control,
          item.parent.SequentialId
        );
      case 'action':
        return getFriendlyId(Parent_Type_Enum.Action, item.parent.SequentialId);
      case 'issue_assessment':
        return getFriendlyId(
          Parent_Type_Enum.Issue,
          item.parent.issue_assessment?.parent?.SequentialId
        );
      default:
        return getFriendlyId(
          item.parent.ObjectType as Parent_Type_Enum,
          item.parent.SequentialId
        );
    }
  };

  return useMemo((): ChangeRequestRegisterFields[] => {
    if (!data) {
      return [];
    }

    return data.change_request.map((cr) => {
      const allLevelsApproved =
        getCurrentLevel(cr.responses) > getMaxLevel(cr.responses);

      return {
        ...cr,
        ParentType: cr.parent?.ObjectType
          ? objectTypeMapping[
              cr.parent?.ObjectType as keyof typeof objectTypeMapping
            ]
          : '',
        Workflow:
          workflowMap[
            (cr.Workflow ??
              cr.responses[0]?.approver?.level?.approval
                ?.Workflow) as keyof typeof workflowMap
          ],
        StatusLabelled: getByValue(cr.ChangeRequestStatus)?.label ?? '-',
        ParentSequentialId: getParentSequentialId(cr),
        RequiresAction: isActiveApprover(
          cr,
          cr.currentUserOwnerList?.map((u) => u.UserId ?? '')
        ),
        ParentName: getParentName(cr),
        allApprovers:
          cr.responses?.map((response, i) => ({
            id: response.approver.OwnerApprover
              ? String(i)
              : (response.approver.user?.Id ?? ''),
            label: response.approver.OwnerApprover
              ? 'Owner' // TODO: Translation
              : (response.approver.user?.FriendlyName ??
                response.approver.group?.Name ??
                ''),
          })) ?? [],
        allRequesters: [
          {
            id: cr.createdBy?.Id ?? '',
            label: cr.createdBy?.FriendlyName ?? '',
          },
          ...cr.contributors.map((c) => ({
            id: c.user?.Id ?? '',
            label: c.user?.FriendlyName ?? '',
          })),
        ],
        approvalConfig: Array.from(
          new Set(cr.responses.map((r) => r.approver.level?.approval?.Id ?? ''))
        ),
        DateLastActioned: cr.responses
          .filter((r) => r.Approved !== null)
          .map((r) => r.ModifiedAtTimestamp)
          .sort((a, b) => b.localeCompare(a))
          .pop(),
        DateClosed:
          cr.ChangeRequestStatus !== Approval_Status_Enum.Pending
            ? cr.ModifiedAtTimestamp
            : null,
        CurrentLevel: allLevelsApproved
          ? '-'
          : t('common:approvals.requestsRegister.columns.currentLevelValue', {
              current: getCurrentLevel(cr.responses),
              max: getMaxLevel(cr.responses),
            }),
        currentApprovers: getCurrentApprovers(cr.responses),
        nextApprovers: getNextApprovers(cr.responses),
        parentOwners:
          (cr.parent?.acceptance?.parents?.map((p) => p?.risk?.owners) || [])
            .concat(
              cr.parent?.risk?.owners,
              cr.parent?.control?.owners,
              cr.parent?.action?.owners,
              cr.parent?.documentFile?.parent?.owners,
              cr.parent?.issue_assessment?.parent?.owners
            )
            .flat()
            .filter(Boolean)
            .map((owner) => ({
              id: owner?.user?.Id ?? '',
              label: owner?.user?.FriendlyName ?? '',
            })) ?? [],
      };
    });
  }, [
    data,
    workflowMap,
    objectTypeMapping,
    getByValue,
    isActiveApprover,
    getCurrentLevel,
    getMaxLevel,
    getCurrentApprovers,
    getNextApprovers,
    t,
  ]);
};
