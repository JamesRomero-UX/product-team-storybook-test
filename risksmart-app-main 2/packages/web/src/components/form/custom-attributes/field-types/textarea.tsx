import { matchToField } from '@/utils/table/utils/customAttributeHelpers';

import ControlledTextarea from '../../controlled-textarea';
import { CustomAttributeTextarea } from '../renderers/field-layouts/CustomAttributeTextarea';
import { getBasicFieldConfig } from './defaults';
import { type FieldTypeConfig } from './types';

export const textArea: FieldTypeConfig = {
  i18nKey: 'customAttributes.fieldTypes.textarea',
  DefaultValueComponent: ControlledTextarea,
  FieldComponent: CustomAttributeTextarea,
  getTableFieldConfig: (renderProps) => ({
    ...getBasicFieldConfig(renderProps),
    cell: (data) => matchToField(data.CustomAttributeData, renderProps.path),
  }),
  supportsDefaultValue: true,
  allowAsConditionSource: true,
};
