import type { InputProps } from '@risk-smart/themed-cloudscape-components/input';
import Input from '@risk-smart/themed-cloudscape-components/input';
import _ from 'lodash';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { Noop, RefCallBack } from 'react-hook-form';

const valueToString = (value: null | number | string | undefined) =>
  !_.isNil(value) ? String(value) : '';

const stringToValue = (type: InputProps.Type | undefined, value: string) =>
  type === 'number' ? (value === '' ? null : Number(value)) : value;

export interface TextInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  name?: string;
  adornment?: ReactNode;
  errorMessage?: string;
  innerRef?: RefCallBack;
  onBlur?: Noop;
  onChange: (value: null | number | string) => void;
  value: null | number | string | undefined;
}

/**
 * Based on cloudscape input, but with support for adornments and number values
 * @returns
 */
export const TextInput = ({
  adornment,
  value,
  type,
  innerRef,
  onBlur,
  name,
  onChange,
  ...props
}: TextInputProps) => {
  const className = adornment ? 'flex md:max-w-[750px]' : '';
  // Keeping local value of state as user needs to be able to enter decimal numbers such
  // as 0.0001. Whilst typing this number, values such as 0.00 will be converted to a text value of 0
  // preventing the users from fully entering the value (as this is a controlled component)
  const [textValue, setTextValue] = useState<string>(valueToString(value));

  // Handle change of value outside of local state
  useEffect(() => {
    const stringValue = valueToString(value);
    if (stringValue !== textValue) {
      setTextValue(stringValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={className}>
      <Input
        {...{ className: 'grow' }}
        type={type}
        ref={innerRef}
        name={name}
        value={textValue}
        onBlur={onBlur}
        onChange={(e) => {
          setTextValue(e.detail.value);
          const newValue = stringToValue(type, e.detail.value);
          if (newValue === value) {
            return;
          }
          onChange(newValue);
        }}
        {...props}
      />
      {adornment}
    </div>
  );
};
