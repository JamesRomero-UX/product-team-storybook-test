import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import type { FormId } from '@risksmart-app/shared/forms/formConfigRegistry';

import type { FieldFormFields } from '../custom-attributes/edit-fields/fieldSchema';
import type { EditMode } from './types';

export interface EditFieldModalProps {
  parentType: FormId;
  onDismiss: () => void;
  fieldId?: string;
  values?: FieldFormFields;
  fieldPath?: string;
  editMode?: EditMode;
  defaultRequired?: boolean;
  forceRequired?: boolean;
  defaultValueOptions: SelectProps.Options;
  allowDefaultValue?: boolean;
}
