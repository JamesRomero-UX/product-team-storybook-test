import type { FieldValues } from 'react-hook-form';
import { FormField } from 'src/components/form/form/FormField';

import { Controller } from '../field-controller/Controller';
import type { ControlledBaseProps } from '../types';
import JsonEditor from './JsonEditor';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  disabled?: boolean;
}

export const ControlledJsonEditor = <T extends FieldValues>({
  name,
  label,
  control,
  forceRequired,
  defaultRequired,
  allowDefaultValue,
  ...props
}: Props<T>) => {
  const { error } = control.getFieldState(name);

  return (
    <Controller
      defaultRequired={defaultRequired}
      forceRequired={forceRequired}
      allowDefaultValue={allowDefaultValue}
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <FormField label={label} errorText={error?.message} stretch>
          <JsonEditor
            key={String(props.disabled)}
            value={value}
            disabled={props.disabled}
            onChange={(value) => onChange(value)}
            {...props}
          />
        </FormField>
      )}
    />
  );
};
