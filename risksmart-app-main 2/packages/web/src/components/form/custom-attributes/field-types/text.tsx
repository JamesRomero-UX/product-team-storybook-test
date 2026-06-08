import { matchToField } from '@/utils/table/utils/customAttributeHelpers';

import ControlledInput from '../../controlled-input';
import { CustomAttributeInput } from '../renderers/field-layouts/CustomAttributeInput';
import { getBasicFieldConfig } from './defaults';
import { type FieldTypeConfig } from './types';

export const text: FieldTypeConfig = {
  i18nKey: 'customAttributes.fieldTypes.text',
  DefaultValueComponent: ControlledInput,
  FieldComponent: CustomAttributeInput,
  getTableFieldConfig: (renderProps) => ({
    ...getBasicFieldConfig(renderProps),
    cell: (data) => matchToField(data.CustomAttributeData, renderProps.path),
  }),
  supportsDefaultValue: true,
  allowAsConditionSource: true,
};
