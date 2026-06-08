import type { Control, FieldPath, FieldValues } from 'react-hook-form';

export type ControlledProps<
  OriginalProps,
  T extends FieldValues = FieldValues,
  TName extends FieldPath<T> = FieldPath<T>,
> = Omit<OriginalProps, 'value'> & { control: Control<T>; name: TName };
