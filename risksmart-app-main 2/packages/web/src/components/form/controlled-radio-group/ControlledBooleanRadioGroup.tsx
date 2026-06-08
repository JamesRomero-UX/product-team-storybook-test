import type { FieldValues } from 'react-hook-form';

import type {
  ControlledRadioGroupProps,
  Transform,
} from './ControlledRadioGroup';
import { ControlledRadioGroup } from './ControlledRadioGroup';
import { yesNoOptions } from './radioGroupUtils';

type Props<T extends FieldValues> = Omit<
  ControlledRadioGroupProps<T, boolean | null>,
  'transform'
>;

const boolToStringTransform: Transform<boolean | null> = {
  input: function (value) {
    return String(value);
  },
  output: function (value) {
    switch (value) {
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        return null;
    }
  },
};

export const ControlledBooleanRadioGroup = <T extends FieldValues>({
  items,
  ...rest
}: Props<T>) => {
  return (
    <ControlledRadioGroup<T, boolean | null>
      {...rest}
      transform={boolToStringTransform}
      items={items || yesNoOptions}
    />
  );
};
