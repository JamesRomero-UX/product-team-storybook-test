import type { InputProps } from '@risk-smart/themed-cloudscape-components/input';
import Input from '@risk-smart/themed-cloudscape-components/input';
import type { Noop } from 'react-hook-form';

import styles from './style.module.scss';

interface SimpleDateInputProps {
  value: string;
  onBlur?: Noop;

  onChange?: (value: string) => void;
  disabled?: boolean;
  testId?: string;
}
interface DateInputProps extends InputProps {
  type: InputProps.Type & 'date';
}

const SimpleDateInput = ({
  value,
  onBlur,
  onChange,
  disabled,
  testId,
}: SimpleDateInputProps) => {
  const formatValue = (value: string) => {
    let dateValue = value;
    if (value && value.includes('T')) {
      const [date] = value.split('T');
      dateValue = date;
    }

    return dateValue;
  };

  return (
    <Input
      {...({ type: 'date', className: styles.noCalPicker } as DateInputProps)}
      data-testid={testId}
      value={formatValue(value)}
      onBlur={onBlur}
      onChange={(e) => {
        onChange?.(e.detail.value);
      }}
      disabled={disabled}
    />
  );
};

export default SimpleDateInput;
