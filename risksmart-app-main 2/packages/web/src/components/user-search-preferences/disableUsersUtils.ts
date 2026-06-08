import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';

import type { HidableOption } from '../form/controlled-multiselect/types';

export const disableOptionForHidableOption = (
  option: HidableOption,
  disabledOptions: { userId: string; reason: string }[]
): HidableOption => {
  const disabledOption = disabledOptions?.find((disabledOption) => {
    return disabledOption.userId === option.value;
  });

  return disabledOption
    ? {
        ...option,
        disabled: true,
        disabledReason: disabledOption?.reason,
      }
    : option;
};

export const disableOptionsForOptionGroup = (
  optionGroup: SelectProps.OptionGroup,
  disabledOptions: { userId: string; reason: string }[]
): SelectProps.OptionGroup => {
  const options = optionGroup.options.map((option) => {
    const disabledOption = disabledOptions?.find((disabledOption) => {
      return disabledOption.userId === option.value;
    });

    return disabledOption
      ? {
          ...option,
          disabled: true,
          disabledReason: disabledOption?.reason,
        }
      : option;
  });

  return { ...optionGroup, options: options };
};
