import type { MultiselectProps } from '@risk-smart/themed-cloudscape-components/multiselect';
import { forwardRef } from 'react';

import type { HidableOption } from '../controlled-multiselect/types';
import useFilterHiddenOptions from '../controlled-multiselect/useFilterHiddenOptions';
import MultiSelect from '.';

const HiddenOptionMultiSelect = forwardRef<
  MultiselectProps.Ref,
  MultiselectProps & { testId?: string }
>(({ options, testId, ...rest }, ref) => {
  const filteredOptions = useFilterHiddenOptions(
    options as HidableOption[] | undefined
  );

  return (
    <MultiSelect
      data-testid={testId}
      {...rest}
      options={filteredOptions}
      ref={ref}
    />
  );
});

export default HiddenOptionMultiSelect;
