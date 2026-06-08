import type { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
import type { FormFieldOption } from '@risksmart-app/form-configuration/src/types';

export interface FieldRendererProps {
  type: CustomAttributeFieldType;
  label: string;
  altLabel?: string;
  scope: string;
  path: string;
  options?: FormFieldOption[];
}
