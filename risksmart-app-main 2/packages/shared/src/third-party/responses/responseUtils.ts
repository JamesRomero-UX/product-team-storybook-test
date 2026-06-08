import {
  ThirdPartyResponseAction,
  ThirdPartyResponseStatus,
} from '@risksmart-app/domain/src/types/consts';

export const getAllowedStatusesByAction = (
  action: ThirdPartyResponseAction | undefined
): ThirdPartyResponseStatus[] => {
  if (!action) {
    return [];
  }

  if (action === ThirdPartyResponseAction.Recall) {
    return [
      ThirdPartyResponseStatus.AwaitingReview,
      ThirdPartyResponseStatus.InProgress,
      ThirdPartyResponseStatus.Expired,
      ThirdPartyResponseStatus.NotStarted,
    ];
  }

  if (
    action === ThirdPartyResponseAction.Approve ||
    action === ThirdPartyResponseAction.Reject ||
    action === ThirdPartyResponseAction.RequestMoreInformation
  ) {
    return [ThirdPartyResponseStatus.AwaitingReview];
  }

  return [];
};

export const getIsActionAllowed = (
  action: ThirdPartyResponseAction | undefined,
  status: ThirdPartyResponseStatus | undefined
) => {
  if (!action || !status) {
    return false;
  }

  return getAllowedStatusesByAction(action).includes(status);
};

export const getNewStatus = (
  action: ThirdPartyResponseAction
): ThirdPartyResponseStatus => {
  return {
    [ThirdPartyResponseAction.Approve]: ThirdPartyResponseStatus.Completed,
    [ThirdPartyResponseAction.RequestMoreInformation]:
      ThirdPartyResponseStatus.InProgress,
    [ThirdPartyResponseAction.Recall]: ThirdPartyResponseStatus.Recalled,
    [ThirdPartyResponseAction.Reject]: ThirdPartyResponseStatus.Rejected,
  }[action];
};
