import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import { useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';

import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import type { ControlledBaseProps } from '../types';
import { SelectWithFormField } from './SelectWithFormField';

export type StatusType = 'error' | 'finished' | 'loading' | 'pending';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  options: SelectProps.Options | undefined;
  filteringType?: SelectProps.FilteringType;
  addEmptyOption?: boolean;
  type?: 'number' | 'string';
  constraintText?: React.ReactNode;
  disabled?: boolean;
  statusType?: StatusType;
  onChange?: (value: null | number | string | undefined) => void;
  testId: string;
  className?: string;
  onBlur?: () => void;
  stretch?: boolean;
}

export const ControlledSelect = <T extends FieldValues>({
  name,
  control,
  label,
  options,
  addEmptyOption,
  stretch = true,
  type,
  constraintText,
  forceRequired,
  defaultRequired,
  allowDefaultValue,
  description,
  className,
  onBlur,
  ...props
}: Props<T>) => {
  const { error } = control.getFieldState(name);
  const optionItems = useGetOptionsWithEmptyOption(options, addEmptyOption);
  const readOnly = useIsFieldReadOnly(name);

  return (
    <Controller
      defaultRequired={defaultRequired}
      name={name}
      forceRequired={forceRequired}
      allowDefaultValue={allowDefaultValue}
      defaultValueOptions={optionItems}
      control={control}
      render={({
        field: { ref, onChange, onBlur: onControllerBlur, value },
      }) => {
        return (
          <SelectWithFormField
            className={className}
            type={type}
            innerRef={ref}
            label={label}
            stretch={stretch}
            description={description}
            value={value}
            options={optionItems}
            errorMessage={error?.message}
            constraintText={constraintText}
            {...props}
            disabled={readOnly || props.disabled}
            onBlur={() => {
              onControllerBlur();
              onBlur?.();
            }}
            onChange={(e) => {
              onChange(e);
              props.onChange?.(e);
            }}
          />
        );
      }}
    />
  );
};

const useGetOptionsWithEmptyOption = (
  options: SelectProps.Options | undefined,
  addEmptyOption: boolean | undefined
) => {
  const optionItems = useMemo<(SelectProps.Option | SelectProps.OptionGroup)[]>(
    () => [
      ...(addEmptyOption
        ? [
            {
              value: '',
              label: '-',
            },
          ]
        : []),
      ...(options || []),
    ],
    [options, addEmptyOption]
  );

  return optionItems;
};
