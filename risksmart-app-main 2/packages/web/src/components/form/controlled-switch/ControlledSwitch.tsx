import type { ToggleProps } from '@risk-smart/themed-cloudscape-components/toggle';
import Toggle from '@risk-smart/themed-cloudscape-components/toggle';
import { forwardRef } from 'react';
import type { FieldValues } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import type { ControlledBaseProps } from '../types';

type SwitchProps = ToggleProps & { label?: string; testId?: string };

export const Switch = forwardRef<ToggleProps.Ref, SwitchProps>(
  ({ label = '', testId, ...switchProps }, ref) => {
    return (
      <Toggle data-testid={testId} ref={ref} {...switchProps}>
        {label}
      </Toggle>
    );
  }
);

Switch.displayName = 'Switch';

type ControlledSwitchProps<T extends FieldValues> = ControlledBaseProps<T> &
  Omit<SwitchProps, 'checked'>;

export function ControlledSwitch<T extends FieldValues>(
  props: ControlledSwitchProps<T>
) {
  const { control } = useFormContext<FieldValues>();
  const readOnly = useIsFieldReadOnly(props.name);

  return (
    <Controller
      defaultRequired={props.defaultRequired}
      forceRequired={props.forceRequired}
      allowDefaultValue={props.allowDefaultValue}
      name={props.name}
      control={control}
      render={({ field: { ref, onChange, onBlur, value } }) => (
        <Switch
          {...props}
          ref={ref}
          onChange={(e) => onChange(e.detail.checked)}
          onBlur={onBlur}
          checked={value}
          disabled={props.disabled}
          readOnly={props.readOnly || readOnly}
        />
      )}
    />
  );
}
