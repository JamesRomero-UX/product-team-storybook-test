import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import type { Content } from '../help-panel/useHelpStore';

export interface ControlledBaseProps<
  T extends FieldValues,
  TName extends FieldPath<T> = FieldPath<T>,
> {
  testId?: string;
  name: TName;
  label: string;
  description?: Content;
  placeholder?: string;
  control: Control<T>;
  forceRequired?: boolean;
  defaultRequired?: boolean;
  readOnly?: boolean;
  allowDefaultValue?: boolean;
}
