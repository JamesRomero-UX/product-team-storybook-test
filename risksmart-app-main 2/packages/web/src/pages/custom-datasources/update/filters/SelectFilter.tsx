import type { PropertyFilterOperatorFormProps } from '@cloudscape-design/collection-hooks';
import type { SelectProps } from '@risk-smart/themed-cloudscape-components';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Select from '@risk-smart/themed-cloudscape-components/select';
import type { FC } from 'react';

const SelectFilter: FC<
  PropertyFilterOperatorFormProps<string> & { options: SelectProps.Option[] }
> = ({ value, onChange, options }) => {
  return (
    <FormField>
      <Select
        expandToViewport={true}
        virtualScroll={true}
        filteringType={'auto'}
        options={options}
        selectedOption={options.find((o) => o.value === value) ?? null}
        onChange={(event) => onChange(event.detail.selectedOption.value ?? '')}
      />
    </FormField>
  );
};

export default SelectFilter;
