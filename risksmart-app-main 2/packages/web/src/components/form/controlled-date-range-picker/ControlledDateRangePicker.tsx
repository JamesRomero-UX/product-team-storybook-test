import type { DateRangePickerProps } from '@risk-smart/themed-cloudscape-components/date-range-picker';
import DateRangePicker from '@risk-smart/themed-cloudscape-components/date-range-picker';
import type { FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormField } from 'src/components/form/form/FormField';

import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import type { ControlledBaseProps } from '../types';
import { createDefaultValidator } from './dateRangePickerUtils';
import { defaultRelativeOptions } from './defaultRelativeOptions';

interface DateRangePickerInputProps {
  label?: string;
  placeholder?: string;
  errorMessage?: string;
  disabled?: boolean;
  value: DateRangePickerProps.Value | null;
  relativeOptions?: DateRangePickerProps.RelativeOption[];
  onChange?: (value: DateRangePickerProps.Value | null) => void;
  isExpandable?: boolean;
}

export const DateRangePickerInput = ({
  value,
  placeholder,
  relativeOptions,
  disabled,
  onChange,
  isExpandable = false,
}: DateRangePickerInputProps) => {
  const { t } = useTranslation('common');
  const translations = t('dateRangeInput', { returnObjects: true });

  return (
    <DateRangePicker
      value={value}
      onChange={(e) => onChange?.(e.detail.value)}
      placeholder={placeholder}
      relativeOptions={relativeOptions || defaultRelativeOptions}
      isValidRange={createDefaultValidator(t)}
      disabled={disabled}
      expandToViewport={isExpandable}
      dateOnly
      absoluteFormat={'long-localized'}
      hideTimeOffset={true}
      i18nStrings={{
        formatRelativeRange: ({ unit, amount }) => {
          const isPast = amount < 0;

          return isPast
            ? t(`relativeTimes.previous.${unit}`, { count: -amount })
            : t(`relativeTimes.next.${unit}`, { count: amount });
        },
        ...translations,
      }}
    />
  );
};

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  stretch?: boolean;
  disabled?: boolean;
  onChange?: (value: DateRangePickerProps.Value | null) => void;
}

export const ControlledDateRangePicker = <T extends FieldValues>({
  name,
  label,
  control,
  placeholder,
  onChange,
  forceRequired,
  defaultRequired,
  allowDefaultValue,
  ...props
}: Props<T>) => {
  const { error } = control.getFieldState(name);
  const readOnly = useIsFieldReadOnly(name);

  return (
    <Controller
      defaultRequired={defaultRequired}
      forceRequired={forceRequired}
      allowDefaultValue={allowDefaultValue}
      name={name}
      control={control}
      render={({ field: { value, onChange: formOnChange } }) => (
        <FormField label={label} errorText={error?.message}>
          <DateRangePickerInput
            value={value}
            onChange={(val) => {
              formOnChange(val);
              onChange?.(val);
            }}
            placeholder={placeholder}
            disabled={readOnly}
            {...props}
          />
        </FormField>
      )}
    />
  );
};
