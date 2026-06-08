import type { RadioGroupProps } from '@risk-smart/themed-cloudscape-components/radio-group';

import type { Transform } from './ControlledRadioGroup';

export const yesNoOptions: RadioGroupProps.RadioButtonDefinition[] = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];
export const noTransform: Transform<string> = {
  input: function (value) {
    return value;
  },
  output: function (value) {
    return value;
  },
};
export const numberTransform: Transform<number> = {
  input: function (value) {
    return value?.toString() ?? '';
  },
  output: function (value) {
    return Number(value);
  },
};
