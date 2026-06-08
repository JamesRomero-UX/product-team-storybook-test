import type { JSONObject } from '@/types/types';
import type { FieldConfig } from '@/utils/table/types';
import {
  matchToField,
  resolveDisplayValues,
} from '@/utils/table/utils/customAttributeHelpers';

import type { FieldRendererProps } from '../renderers/collection-layouts/types';

export const getBasicFieldConfig = (
  renderProps: FieldRendererProps,
  options?: { useAlternateValues: boolean }
): FieldConfig<{
  CustomAttributeData: JSONObject;
}> => {
  return {
    header:
      options?.useAlternateValues && renderProps.altLabel
        ? renderProps.altLabel
        : renderProps.label,
    custom: true,
    customFieldValue: (item) => {
      return matchToField(item.CustomAttributeData, renderProps.path);
    },
    exportVal: (item) => {
      return matchToField(
        item.CustomAttributeData,
        renderProps.path,
        resolveDisplayValues({
          formFieldOptions: renderProps.options,
          useAlternativeValues: options?.useAlternateValues ?? false,
        })
      );
    },
  };
};
