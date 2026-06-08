import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import type { FC } from 'react';

import type { HidableOption } from '../controlled-multiselect/types';
import useFilterHiddenOptions from '../controlled-multiselect/useFilterHiddenOptions';
import Select from '.';

const HiddenOptionSelect: FC<SelectProps> = ({ options, ...rest }) => {
  const filteredOptions = useFilterHiddenOptions(
    options as HidableOption[] | undefined
  );

  return <Select {...rest} options={filteredOptions} />;
};

export default HiddenOptionSelect;
