import type { FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { ControlledBaseProps } from 'src/components/form/types';

import { ColourInput } from './ColourInput';

export const ControlledColourInput = <T extends FieldValues>({
  control,
  name,
  testId,
}: ControlledBaseProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <ColourInput value={value} onChange={onChange} testId={testId} />
      )}
    />
  );
};
