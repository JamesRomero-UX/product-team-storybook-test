import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';

export type StatusType = 'error' | 'finished' | 'loading' | 'pending';

export const getSelectedOption = (
  value: null | string | undefined,
  optionItems: (SelectProps.Option | SelectProps.OptionGroup)[]
) => {
  if (value === null) {
    return value;
  }

  const matchingItem: null | SelectProps.Option = null;
  for (const option of optionItems) {
    if ('value' in option && option.value === value) {
      return option;
    }
    if ('options' in option) {
      for (const childOption of option.options) {
        if ('value' in childOption && childOption.value === value) {
          return childOption;
        }
      }
    }
  }
  if (!matchingItem) {
    // This can be the case for "Standard" role users, where they don't have permission to view the currently
    // selected option e.g. a parent risk
    return {
      value,
    };
  }

  return matchingItem;
};
