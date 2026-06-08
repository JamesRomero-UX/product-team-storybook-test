import type { AutosuggestProps } from '@risk-smart/themed-cloudscape-components/autosuggest';
import Autosuggest from '@risk-smart/themed-cloudscape-components/autosuggest';
import type { FieldValues } from 'react-hook-form';
import { FormField } from 'src/components/form/form/FormField';

import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import type { ControlledBaseProps } from '../types';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  options: AutosuggestProps.Options | undefined;
  onSelect?: AutosuggestProps['onSelect'];
  enableVirtualScroll?: boolean;
  disabled?: boolean;
}

export const ControlledAutosuggest = <T extends FieldValues>({
  name,
  label,
  control,
  options,
  onSelect,
  forceRequired,
  enableVirtualScroll = false,
  defaultRequired,
  description,
  allowDefaultValue,
  testId,
  ...props
}: Props<T>) => {
  const { error } = control.getFieldState(name);
  const readOnly = useIsFieldReadOnly(name);

  return (
    <Controller
      forceRequired={forceRequired}
      defaultRequired={defaultRequired}
      allowDefaultValue={allowDefaultValue}
      name={name}
      control={control}
      render={({ field: { ref, onChange, onBlur, value } }) => (
        <FormField
          label={label}
          testId={testId}
          errorText={error?.message}
          stretch
          guidance={description}
        >
          <Autosuggest
            ref={ref}
            name={name}
            value={value ?? ''} // fallback to empty string as undefined/null causes an error
            onBlur={onBlur}
            onSelect={onSelect}
            onChange={(e) => onChange(e.detail.value)}
            options={options}
            virtualScroll={enableVirtualScroll}
            enteredTextLabel={(value) => `Use: "${value}"`}
            ariaLabel={'Enter value'}
            placeholder={'Enter value'}
            empty={'No matches found'}
            {...props}
            disabled={readOnly || props.disabled}
          />
        </FormField>
      )}
    />
  );
};
