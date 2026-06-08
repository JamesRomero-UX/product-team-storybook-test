import type { ContentText } from 'pdfmake/interfaces';
import type { CustomAttributeSchema } from 'src/components/form/custom-attributes/CustomAttributeSchema';
import { fieldTypesConfig } from 'src/components/form/custom-attributes/field-types';

import type { JSONObject } from '@/types/types';
import { createField } from '@/utils/pdf/field';

import { getCustomAttributeRenderProps } from '../table/utils/customAttributes';

export function getCustomAttributeDataForExport<
  T extends {
    CustomAttributeData?: JSONObject | null;
  },
>(
  item: T,
  schemas: CustomAttributeSchema | null | undefined
): (ContentText | string)[] {
  const fields: (ContentText | string)[] = [];
  if (!schemas?.Schema || !schemas?.UiSchema) {
    return fields;
  }

  // render column collections from schemas.
  const collections = getCustomAttributeRenderProps(
    schemas?.Schema || {},
    schemas?.UiSchema || {}
  );
  // map collections to config using type.
  collections.forEach((fieldRenderProps) => {
    const { label, path, type } = fieldRenderProps;
    const matchToField = (data: JSONObject | null) =>
      data ? (data[path] as string) || '' : '';
    if (!item.CustomAttributeData) {
      return fields;
    }
    const fieldConfig = fieldTypesConfig[type];
    let value;
    if (fieldConfig?.getPdfExportValue) {
      value = fieldConfig.getPdfExportValue(fieldRenderProps, item);
    } else {
      value = matchToField(item.CustomAttributeData);
    }
    fields.push(...createField(label, value));
  });

  return fields;
}
