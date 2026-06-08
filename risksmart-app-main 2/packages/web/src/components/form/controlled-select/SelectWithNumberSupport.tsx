import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import type { Noop, RefCallBack } from 'react-hook-form';

import Select from '../select';
import type { StatusType } from './SelectUtils';
import { getSelectedOption } from './SelectUtils';

export interface SelectWithNumberSupportProps {
  value: null | string;
  options: SelectProps.Options;
  onChange: (value: null | number | string | undefined) => void;
  onBlur?: Noop;
  filteringType?: SelectProps.FilteringType;
  type?: 'number' | 'string';
  disabled?: boolean;
  statusType?: StatusType;
  placeholder?: string;
  innerRef?: RefCallBack;
  className?: string;
  expandToViewport?: boolean;
}

export const SelectWithNumberSupport = ({
  value,
  onChange,
  onBlur,
  type,
  placeholder,
  innerRef,
  options,
  ...props
}: SelectWithNumberSupportProps) => {
  const coercedValue = type === 'number' ? String(value) : value;
  const currentSelectedOption = getSelectedOption(coercedValue, [...options]);

  return (
    <Select
      virtualScroll={options.length >= 500}
      ref={innerRef}
      selectedOption={
        currentSelectedOption?.value ? currentSelectedOption : null
      }
      onBlur={onBlur}
      onChange={(e) => {
        const val =
          e.detail.selectedOption.value === ''
            ? null
            : e.detail.selectedOption.value;
        const coercedValue =
          type === 'number' && val !== null ? Number(val) : val;
        onChange(coercedValue);
      }}
      options={options}
      placeholder={placeholder ?? 'Enter value'}
      empty={'No matches found'}
      {...props}
    />
  );
};
