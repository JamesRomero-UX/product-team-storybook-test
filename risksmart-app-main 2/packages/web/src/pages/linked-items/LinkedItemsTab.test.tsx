import { getUnlinkFriendlyErrorMessage } from './linkedItemUtils';

describe('LinkedItemsTab', () => {
  describe('getUnlinkFriendlyErrorMessage', () => {
    it('Returns "Failed to remove links" when no match is found', () => {
      const result = getUnlinkFriendlyErrorMessage('Some random error');
      expect(result).toEqual('Failed to remove links');
    });

    it('Returns "Removing links between {match1} and {match2} is not supported" when matches is found', () => {
      const result = getUnlinkFriendlyErrorMessage(
        `linking {action} to {risk} is not supported`
      );
      expect(result).toEqual(
        'Removing links between actions and risks is not supported.'
      );
    });
  });
});
