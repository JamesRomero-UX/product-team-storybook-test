import type { RadioGroupProps } from '@risk-smart/themed-cloudscape-components/radio-group';
import RadioGroup from '@risk-smart/themed-cloudscape-components/radio-group';
import { useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';
import { FormField } from 'src/components/form/form/FormField';

import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import type { ControlledBaseProps } from '../types';
import styles from './style.module.scss';

export interface ControlledRadioGroupProps<
  T extends FieldValues,
  TOutput,
> extends ControlledBaseProps<T> {
  items: RadioGroupProps['items'] | undefined;
  transform: {
    input: (value: TOutput) => string;
    output: (value: string) => TOutput;
  };
  onChange?: (item: TOutput) => void;
  disabled?: boolean;
  testId?: string;
  hideLabel?: boolean;
}

export type Transform<TOutput> = {
  input: (value: TOutput) => string;
  output: (value: string) => TOutput;
};

export const ControlledRadioGroup = <T extends FieldValues, TOutput = string>({
  name,
  control,
  label,
  hideLabel,
  items,
  transform,
  onChange,
  disabled,
  forceRequired,
  defaultRequired,
  allowDefaultValue,
  testId,
  description,
  ...props
}: ControlledRadioGroupProps<T, TOutput>) => {
  const { error } = control.getFieldState(name);
  const readOnly = useIsFieldReadOnly(name);
  const xItems = useMemo<RadioGroupProps.RadioButtonDefinition[] | undefined>(
    () => items?.map((i) => ({ ...i, disabled: disabled || readOnly })),
    [disabled, readOnly, items]
  );

  return (
    <Controller
      name={name}
      defaultRequired={defaultRequired}
      allowDefaultValue={allowDefaultValue}
      defaultValueOptions={items?.map((i) => ({
        value: i.value,
        label: String(i.label),
      }))}
      control={control}
      forceRequired={forceRequired}
      render={({ field: { ref, onChange: formOnChange, value } }) => (
        <div className={styles.radioGroup}>
          {hideLabel ? (
            <RadioGroup
              data-testid={testId}
              ref={ref}
              name={name}
              items={xItems}
              value={transform.input(value)}
              onChange={(e) => {
                const value = transform.output(e.detail.value);
                formOnChange(value);
                onChange?.(value);
              }}
              {...props}
            />
          ) : (
            <FormField
              label={label}
              errorText={error?.message}
              stretch
              testId={testId}
              guidance={description}
            >
              <RadioGroup
                ref={ref}
                name={name}
                items={xItems}
                value={transform.input(value)}
                onChange={(e) => {
                  const value = transform.output(e.detail.value);
                  formOnChange(value);
                  onChange?.(value);
                }}
                {...props}
              />
            </FormField>
          )}
        </div>
      )}
    />
  );
};
