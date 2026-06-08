import { hasLengthAtLeast } from '@risksmart-app/shared/typeGuards';
import groupBy from 'lodash/groupBy';

import type { ChangeRequestForBackendPartsFragment } from '../../../generated/graphql';
import { ApprovalStatusEnum } from '../../../generated/graphql';

export type ChangeRequest = ChangeRequestForBackendPartsFragment;

export const checkStatus = (changeRequest: ChangeRequest) => {
  const levels = groupBy(
    changeRequest.responses,
    (response) => response.approver.level?.Id ?? 'NO-LEVEL'
  );
  let rejected = false;

  const levelResults: boolean[] = [];

  Object.values(levels).forEach((level) => {
    // If there are no approvers at this level, the level is considered approved
    if (!hasLengthAtLeast(level, 1)) {
      levelResults.push(true);

      return;
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
        // If the number of responses is more than the number of approvers, then reject
        // since someone must have rejected it.
        if (responded > approvers) {
          rejected = true;
        }
        break;
      case 'majority_approve':
        // If the number of approvers is more than half, then approve.
        levelResults.push(approvers > level.length / 2);
        // If atleast half of the approvers have rejected, then reject since
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

  const activeLevelId =
    activeLevelIndex !== null ? Object.keys(levels)[activeLevelIndex] : null;

  const status = rejected
    ? ApprovalStatusEnum.Rejected
    : levelResults.every((result) => result)
      ? ApprovalStatusEnum.Approved
      : ApprovalStatusEnum.Pending;

  return {
    activeLevelId,
    status,
  };
};
