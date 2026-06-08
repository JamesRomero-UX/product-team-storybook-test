import { useSubscription } from '@apollo/client';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import type {
  ChangeRequestPartsFragment,
  MyItemsChangeRequestPartsFragment,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Approval_Status_Enum,
  GetChangeRequestByParentIdDocument,
  GetLivePendingChangeRequestsDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import groupBy from 'lodash/groupBy';
import { useEffect, useMemo } from 'react';
import type { LabelledIdArray } from 'src/rbac/types';

import type { ChangeRequestResponses } from '@/utils/changeRequestUtils';
import {
  getCurrentApprovers,
  getCurrentLevel,
  getMaxLevel,
  getNextApprovers,
} from '@/utils/changeRequestUtils';

import { useGetPendingChangeRequests } from './queries';

export type ObjectWithApprovals = {
  Id: string;
};

type ApprovalCheckChangeRequestFragment =
  | MyItemsChangeRequestPartsFragment
  | Pick<ChangeRequestPartsFragment, 'ChangeRequestStatus' | 'responses'>;

type UseChangeRequestResult = {
  pendingChangeRequests: ChangeRequestPartsFragment[];
  pendingDeleteRequests: ChangeRequestPartsFragment[];
  isActiveApprover: (
    changeRequest: ApprovalCheckChangeRequestFragment,
    ownerIds?: string[]
  ) => boolean;
  getCurrentApprovers: (responses: ChangeRequestResponses) => LabelledIdArray;
  getNextApprovers: (responses: ChangeRequestResponses) => LabelledIdArray;
  getCurrentLevel: (responses: ChangeRequestResponses) => number;
  getMaxLevel: (responses: ChangeRequestResponses) => number;
  activeLevelId: (changeRequest: ChangeRequestPartsFragment) => null | string;
  canAmendChangeRequest: (changeRequest: ChangeRequestPartsFragment) => boolean;
  changeRequests: ChangeRequestPartsFragment[];
  loading: boolean;
};

export const getOwners = (
  changeRequest: ChangeRequestPartsFragment
): string[] | undefined => {
  if (changeRequest.parent?.ObjectType === 'document_file') {
    return changeRequest.parent?.documentFile?.parent?.owners?.map(
      (owner) => owner.UserId ?? ''
    );
  }
  if (changeRequest.parent?.ObjectType === 'issue_assessment') {
    return changeRequest.parent?.issue_assessment?.parent?.owners?.map(
      (owner) => owner.UserId ?? ''
    );
  }
  if (changeRequest.parent?.ObjectType === 'acceptance') {
    return changeRequest.parent?.acceptance?.parents
      ?.filter((p) => p.risk)
      .map((p) => p.risk?.owners.map((owner) => owner.UserId ?? '') ?? [])
      .flat(2);
  }

  return changeRequest.parent?.owners?.map((owner) => owner.UserId ?? '');
};

export const useChangeRequests = (
  objectWithApprovals?: ObjectWithApprovals
): UseChangeRequestResult => {
  const { user, isLoading } = useRisksmartUser();
  const userId = user?.userId;
  const { data, refetch } = useGetPendingChangeRequests({
    queryArgs: { parentId: objectWithApprovals?.Id ?? '' },
    shouldSkip: !objectWithApprovals?.Id,
  });

  // Do we need to make this request if we are getting all change requests by parent id in the next call?
  const { data: liveData, loading: liveLoading } = useSubscription(
    GetLivePendingChangeRequestsDocument,
    {
      variables: {
        ParentId: objectWithApprovals?.Id ?? '',
      },
      skip: !objectWithApprovals?.Id,
    }
  );
  const { data: allChangeRequests, loading } = useSubscription(
    GetChangeRequestByParentIdDocument,
    {
      variables: {
        Id: objectWithApprovals?.Id ?? '',
      },
      skip: !objectWithApprovals?.Id,
    }
  );

  useEffect(() => {
    if (
      liveData?.change_request &&
      liveData.change_request.length < 1 &&
      (data?.change_request.length ?? 0) > 0
    ) {
      refetch();
    }
  }, [liveData, data, refetch]);

  const activeLevelId = (changeRequest: ApprovalCheckChangeRequestFragment) => {
    // group approver responses by levels
    const levels = groupBy(
      changeRequest.responses,
      (response) => response.approver.level?.Id ?? 'NO-LEVEL'
    );
    let rejected = false;

    const levelResults: boolean[] = [];

    Object.values(levels).forEach((level) => {
      // If there are no approvers at this level, the level is considered approved
      if (level.length === 0) {
        levelResults.push(true);
      }

      const responded = level.filter(
        (response) => response.Approved !== null
      ).length;
      const approvers = level.filter(
        (response) => response.Approved === true
      ).length;

      // Approval rule decisions
      switch (level[0].approver.level?.ApprovalRuleType) {
        case 'all_approve':
          // If the number of approvers is equal to the number of responses, then approve.
          levelResults.push(approvers === level.length);
          // If the number of responses is more than the number of approvers, then reject
          // since someone must have rejected it.
          if (responded > approvers) {
            rejected = true;
          }
          break;
        case 'any_one_approve':
          // If there is at least one approver, then approve
          levelResults.push(approvers > 0);
          // If everyone has responded and there are no approvers, then reject.
          if (responded === level.length && approvers === 0) {
            rejected = true;
          }
          break;
        case 'majority_approve':
          // If the number of approvers is more than half, then approve.
          levelResults.push(approvers > level.length / 2);
          // If at least half of the approvers have rejected, then reject since
          // it will be impossible to make a majority.
          if (responded - approvers >= level.length / 2) {
            rejected = true;
          }
          break;
      }
    });

    const firstNonRejectedLevelIndex = levelResults.findIndex(
      (result) => !result
    );
    const activeLevelIndex =
      rejected || firstNonRejectedLevelIndex === -1
        ? null
        : firstNonRejectedLevelIndex;

    return activeLevelIndex !== null
      ? Object.keys(levels)[activeLevelIndex]
      : null;
  };

  const isActiveApprover = (
    changeRequest: ApprovalCheckChangeRequestFragment,
    ownerIds?: string[]
  ) => {
    const levelId = activeLevelId(changeRequest);
    const responses = changeRequest.responses.filter(
      (response) => response.approver.level?.Id === levelId
    );

    const isReferencedActiveApprover = responses.some(
      (response) =>
        (response.approver.user?.Id === userId ||
          response.approver.group?.users.some(
            (user) => user?.UserId === userId
          )) &&
        response.Approved === null
    );
    const ownerApprover = responses.some(
      (response) =>
        response.approver.OwnerApprover && response.Approved === null
    );
    const isOwner = ownerIds?.includes(userId!) ?? false;

    return (
      ((ownerApprover && isOwner) || isReferencedActiveApprover) &&
      changeRequest.ChangeRequestStatus === Approval_Status_Enum.Pending
    );
  };

  const canAmendChangeRequest = (changeRequest: ChangeRequestPartsFragment) => {
    const levelId = activeLevelId(changeRequest);
    const level = changeRequest.responses.find(
      (response) => response.approver.level?.Id === levelId
    )?.approver.level;
    const rule = level?.approval?.InFlightEditRule;

    switch (rule) {
      case 'everyone':
        return true;
      case 'approvers':
        return isActiveApprover(changeRequest, getOwners(changeRequest));
      case 'noone':
        return false;
      default:
        return false;
    }
  };

  const pendingChangeRequests = useMemo(
    () =>
      liveData?.change_request.filter((cr) => cr.Type === 'update') ??
      data?.change_request.filter((cr) => cr.Type === 'update') ??
      [],
    [data?.change_request, liveData?.change_request]
  );
  const pendingDeleteRequests = useMemo(
    () =>
      liveData?.change_request.filter((cr) => cr.Type === 'delete') ??
      data?.change_request.filter((cr) => cr.Type === 'delete') ??
      [],
    [data?.change_request, liveData?.change_request]
  );

  const changeRequests = useMemo(
    () => allChangeRequests?.change_request ?? [],
    [allChangeRequests?.change_request]
  );

  return {
    loading: loading || liveLoading || isLoading,
    isActiveApprover,
    activeLevelId,
    canAmendChangeRequest,
    getCurrentApprovers,
    getNextApprovers,
    getCurrentLevel,
    getMaxLevel,
    pendingDeleteRequests,
    pendingChangeRequests,
    changeRequests,
  };
};
