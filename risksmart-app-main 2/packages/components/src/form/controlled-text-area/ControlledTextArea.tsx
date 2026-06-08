import TextArea from '@risk-smart/themed-cloudscape-components/textarea';
import type { FieldValues } from 'react-hook-form';
import { useController } from 'react-hook-form';

import type { ControlledProps } from '../ControlledProps';

type Props<T extends FieldValues = FieldValues> = ControlledProps<
  Parameters<typeof TextArea>[0],
  T
>;

/**
 * Cloudscape Text area control with value and callbacks set by react hook form
 * @param props
 * @returns
 */
const ControlledTextArea = <T extends FieldValues = FieldValues>(
  props: Props<T>
) => {
  const {
    field: { value, ref, onChange, onBlur },
  } = useController({
    name: props.name,
    control: props.control,
  });

  return (
    <TextArea
      {...props}
      value={value}
      ref={ref}
      onBlur={onBlur}
      onChange={(e) => onChange(e.detail.value)}
    />
  );
};

export default ControlledTextArea;
