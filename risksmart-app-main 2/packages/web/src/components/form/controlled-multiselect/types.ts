import type { MultiselectProps } from '@risk-smart/themed-cloudscape-components/multiselect';

export type HidableOption = MultiselectProps.Option & { hidden?: boolean };

export type HidableOptionGroup = MultiselectProps.OptionGroup & {
  hidden?: boolean;
  options: HidableOption[];
};
