import Link from '@/components/link';
import { EMPTY_VALUE } from '@/utils/collectionUtils';
import { matchToField } from '@/utils/table/utils/customAttributeHelpers';

import ControlledInput from '../../controlled-input';
import { CustomAttributeLinkInput } from '../renderers/field-layouts/CustomAttributeLinkInput';
import { getBasicFieldConfig } from './defaults';
import { type FieldTypeConfig } from './types';

export const link: FieldTypeConfig = {
  i18nKey: 'customAttributes.fieldTypes.link',
  DefaultValueComponent: ControlledInput,
  FieldComponent: CustomAttributeLinkInput,
  getTableFieldConfig: (renderProps) => ({
    ...getBasicFieldConfig(renderProps),
    cell: (data) => {
      const link = matchToField(data.CustomAttributeData, renderProps.path);

      return link !== EMPTY_VALUE ? (
        <Link href={link} target={'_blank'} rel={'noopener noreferrer'}>
          {link}
        </Link>
      ) : (
        EMPTY_VALUE
      );
    },
  }),
  getCustomDataSourceFieldDefinition(renderProps) {
    return {
      defaultLabel: renderProps.label,
      displayType: 'link',
      dataType: 'text',
    };
  },
  supportsDefaultValue: true,
  allowAsConditionSource: true,
};
