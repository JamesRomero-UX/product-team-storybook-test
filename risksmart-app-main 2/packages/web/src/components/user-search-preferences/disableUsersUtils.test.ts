import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';

import type { HidableOption } from '../form/controlled-multiselect/types';
import { disableOptionForHidableOption } from './disableUsersUtils';
import { disableOptionsForOptionGroup } from './disableUsersUtils';
describe('disable users', () => {
  describe('disableOptionForHidableOption', () => {
    it('should disable the option if userId matches', () => {
      const option: HidableOption = { value: 'user1', label: 'User One' };
      const disabledOptions = [
        { userId: 'user1', reason: 'No access' },
        { userId: 'user2', reason: 'Suspended' },
      ];

      const result = disableOptionForHidableOption(option, disabledOptions);

      expect(result).toEqual({
        value: 'user1',
        label: 'User One',
        disabled: true,
        disabledReason: 'No access',
      });
    });

    it('should not disable the option if userId does not match', () => {
      const option: HidableOption = { value: 'user3', label: 'User Three' };
      const disabledOptions = [
        { userId: 'user1', reason: 'No access' },
        { userId: 'user2', reason: 'Suspended' },
      ];

      const result = disableOptionForHidableOption(option, disabledOptions);

      expect(result).toEqual(option);
    });

    it('should handle an empty disabledOptions array', () => {
      const option: HidableOption = { value: 'user1', label: 'User One' };
      const disabledOptions: { userId: string; reason: string }[] = [];

      const result = disableOptionForHidableOption(option, disabledOptions);

      expect(result).toEqual(option);
    });

    it('should handle an empty option', () => {
      const option: HidableOption = { value: '', label: '' };
      const disabledOptions = [
        { userId: 'user1', reason: 'No access' },
        { userId: 'user2', reason: 'Suspended' },
      ];

      const result = disableOptionForHidableOption(option, disabledOptions);

      expect(result).toEqual(option);
    });
  });
  describe('disableOptionsForOptionGroup', () => {
    it('should disable matching options in the group', () => {
      const optionGroup: SelectProps.OptionGroup = {
        label: 'Users',
        options: [
          { value: 'user1', label: 'User One' },
          { value: 'user2', label: 'User Two' },
          { value: 'user3', label: 'User Three' },
        ],
      };

      const disabledOptions = [
        { userId: 'user1', reason: 'No access' },
        { userId: 'user3', reason: 'Suspended' },
      ];

      const result = disableOptionsForOptionGroup(optionGroup, disabledOptions);

      expect(result).toEqual({
        label: 'Users',
        options: [
          {
            value: 'user1',
            label: 'User One',
            disabled: true,
            disabledReason: 'No access',
          },
          { value: 'user2', label: 'User Two' },
          {
            value: 'user3',
            label: 'User Three',
            disabled: true,
            disabledReason: 'Suspended',
          },
        ],
      });
    });

    it('should leave all options enabled if no matches are found', () => {
      const optionGroup: SelectProps.OptionGroup = {
        label: 'Admins',
        options: [
          { value: 'admin1', label: 'Admin One' },
          { value: 'admin2', label: 'Admin Two' },
        ],
      };

      const disabledOptions = [{ userId: 'user1', reason: 'No access' }];

      const result = disableOptionsForOptionGroup(optionGroup, disabledOptions);

      expect(result).toEqual(optionGroup);
    });

    it('should handle an empty options array', () => {
      const optionGroup: SelectProps.OptionGroup = {
        label: 'Empty Group',
        options: [],
      };

      const disabledOptions = [{ userId: 'user1', reason: 'No access' }];

      const result = disableOptionsForOptionGroup(optionGroup, disabledOptions);

      expect(result).toEqual({
        label: 'Empty Group',
        options: [],
      });
    });
  });
});
