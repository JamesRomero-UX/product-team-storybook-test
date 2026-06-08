import {
  ThirdPartyResponseAction,
  ThirdPartyResponseStatus,
} from '@risksmart-app/domain/src/types/consts';

import {
  getAllowedStatusesByAction,
  getIsActionAllowed,
} from './responseUtils';

describe('Third Party Response Utils', () => {
  describe('getAllowedStatusesByAction', () => {
    it('should return the allowed statuses for the action', () => {
      expect(
        getAllowedStatusesByAction(ThirdPartyResponseAction.Recall)
      ).toEqual(['awaiting_review', 'in_progress', 'expired', 'not_started']);

      expect(
        getAllowedStatusesByAction(ThirdPartyResponseAction.Approve)
      ).toEqual(['awaiting_review']);

      expect(
        getAllowedStatusesByAction(ThirdPartyResponseAction.Reject)
      ).toEqual(['awaiting_review']);

      expect(
        getAllowedStatusesByAction(
          ThirdPartyResponseAction.RequestMoreInformation
        )
      ).toEqual(['awaiting_review']);
    });
  });

  describe('getIsActionAllowed', () => {
    it('should return whether the action is allowed for the status', () => {
      expect(
        getIsActionAllowed(
          ThirdPartyResponseAction.Recall,
          ThirdPartyResponseStatus.AwaitingReview
        )
      ).toBe(true);

      expect(
        getIsActionAllowed(
          ThirdPartyResponseAction.Recall,
          ThirdPartyResponseStatus.InProgress
        )
      ).toBe(true);

      expect(
        getIsActionAllowed(
          ThirdPartyResponseAction.Recall,
          ThirdPartyResponseStatus.Completed
        )
      ).toBe(false);

      expect(
        getIsActionAllowed(
          ThirdPartyResponseAction.Approve,
          ThirdPartyResponseStatus.AwaitingReview
        )
      ).toBe(true);

      expect(
        getIsActionAllowed(
          ThirdPartyResponseAction.Approve,
          ThirdPartyResponseStatus.InProgress
        )
      ).toBe(false);
    });
  });
});
