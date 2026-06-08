import Input from '@risk-smart/themed-cloudscape-components/input';
import type { FieldValues } from 'react-hook-form';
import { useController } from 'react-hook-form';

import type { ControlledProps } from '../ControlledProps';

type Props<T extends FieldValues = FieldValues> = ControlledProps<
  Parameters<typeof Input>[0],
  T
>;

/**
 * Cloudscape Input control with value and callbacks set by react hook form
 * @param props
 * @returns
 */
const ControlledInput = <T extends FieldValues = FieldValues>(
  props: Props<T>
) => {
  const {
    field: { value, ref, onChange, onBlur },
  } = useController({
    name: props.name,
    control: props.control,
  });

  return (
    <Input
      {...props}
      value={value}
      ref={ref}
      onBlur={onBlur}
      onChange={(e) => onChange(e.detail.value)}
    />
  );
};

export default ControlledInput;
