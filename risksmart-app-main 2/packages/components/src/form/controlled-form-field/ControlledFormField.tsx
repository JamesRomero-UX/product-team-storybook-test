import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import type { FieldValues } from 'react-hook-form';
import { useController } from 'react-hook-form';

import type { ControlledProps } from '../ControlledProps';

type Props<T extends FieldValues = FieldValues> = ControlledProps<
  Parameters<typeof FormField>[0],
  T
>;

/**
 * Cloudscape FormField control with error set by react hook form
 * @param props
 * @returns
 */
const ControlledFormField = <T extends FieldValues = FieldValues>(
  props: Props<T>
) => {
  const {
    fieldState: { error },
  } = useController({
    name: props.name,
    control: props.control,
  });

  return <FormField {...props} errorText={error?.message} />;
};

export default ControlledFormField;
