import type { AutosuggestProps } from '@risk-smart/themed-cloudscape-components/autosuggest';
import Autosuggest from '@risk-smart/themed-cloudscape-components/autosuggest';
import { useEffect, useState } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { ControlledBaseProps } from 'src/components/form/types';
import Tokens from 'src/components/tokens';

import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import { FormField } from '../form/FormField';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  options: AutosuggestProps.Options | undefined;
  enableVirtualScroll?: boolean;
  check?: (value: string) => boolean;
  onCurrentValueChange?: (value: string) => void;
  disabled?: boolean;
}

export const ControlledMultiAutosuggest = <T extends FieldValues>({
  name,
  label,
  control,
  options,
  forceRequired,
  enableVirtualScroll = false,
  onCurrentValueChange,
  defaultRequired,
  description,
  ...props
}: Props<T>) => {
  const { error } = control.getFieldState(name);
  const readOnly = useIsFieldReadOnly(name);
  const [currentValue, setCurrentValue] = useState('');

  useEffect(() => {
    onCurrentValueChange?.(currentValue);
  }, [currentValue, onCurrentValueChange]);

  return (
    <Controller
      forceRequired={forceRequired}
      defaultRequired={defaultRequired}
      name={name}
      control={control}
      render={({ field: { ref, onChange, onBlur, value } }) => {
        if (!Array.isArray(value) && value !== null && value !== undefined) {
          throw new Error(
            'ControlledMultiAutosuggest value must be an array or null/undefined'
          );
        }

        const selectedOptions =
          value ?? ([] as AutosuggestProps.Options[number][]);

        const onRemove = (val: string) => {
          onChange(selectedOptions.filter((v) => v.value !== val));
        };

        const onAdd = (val: string) => {
          if (props.check && !props.check(val)) {
            return;
          }
          if (!selectedOptions.some((v) => v.value === val)) {
            onChange([...selectedOptions, { value: val, label: val }]);
          }
          setCurrentValue('');
        };

        return (
          <FormField
            label={label}
            errorText={error?.message}
            stretch
            guidance={description}
          >
            <div className={'xs:w-[300px]'}>
              <Autosuggest
                ref={ref}
                name={name}
                value={currentValue} // fallback to empty string as undefined/null causes an error
                onBlur={onBlur}
                onKeyDown={(e) => {
                  if (e.detail.key === 'Enter' && currentValue) {
                    onAdd(currentValue);
                  }
                }}
                onSelect={(value) => {
                  onAdd(value.detail.value);
                }}
                onChange={(e) => setCurrentValue(e.detail.value)}
                options={options}
                virtualScroll={enableVirtualScroll}
                enteredTextLabel={(value) => `Use: "${value}"`}
                ariaLabel={'Enter value'}
                placeholder={'Enter value'}
                empty={'No matches found'}
                {...props}
                disabled={readOnly || props.disabled}
              />
            </div>

            <Tokens
              disabled={readOnly || props.disabled}
              onRemove={onRemove}
              tokens={selectedOptions.map((o) => ({
                value: o.value!,
                label: o.label!,
              }))}
            />
          </FormField>
        );
      }}
    />
  );
};
