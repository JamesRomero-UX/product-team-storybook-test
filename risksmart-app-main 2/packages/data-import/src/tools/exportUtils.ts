import type { JsonSchema7 } from '@jsonforms/core/lib/models/jsonSchema7';
import type {
  ControlElement,
  VerticalLayout,
} from '@jsonforms/core/lib/models/uischema';
import _ from 'lodash';

import type { CustomAttributeSchemaData } from './export';

export const getCustomAttributeLabels = (
  customAttributeSchema: CustomAttributeSchemaData
): { [key: string]: string } => {
  if (!customAttributeSchema) {
    return {};
  }
  const labels: { [key: string]: string } = {};
  const jsonSchema: JsonSchema7 = customAttributeSchema?.Schema;
  const layout = customAttributeSchema?.UiSchema as VerticalLayout;
  const controls = layout.elements.filter(
    (e) => e.type === 'Control'
  ) as ControlElement[];
  for (const property in jsonSchema.properties) {
    const control = controls.find((c) => c.scope.endsWith(property));
    if (!control) {
      throw new Error(`No control found for ${property}`);
    }
    const label = control.label as string;
    if (!label) {
      throw new Error(`No label found for control ${property}`);
    }
    labels[property] = label;
  }

  return labels;
};

export const flattenJSON = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any,
  res = {},
  extraKey = '',
  customAttributeLabels: { [key: string]: string } | null = null,
  customAttributePrefix = 'CA_'
) => {
  for (const k in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (!obj.hasOwnProperty(k)) {
      continue;
    }

    if (typeof obj[k] !== 'object' || obj[k] === null || obj[k] === undefined) {
      // @ts-expect-error ???
      res[`${extraKey}${k}`] = obj[k];
      continue;
    }

    if (k === 'CustomAttributeData') {
      if (customAttributeLabels) {
        _.each(customAttributeLabels, (cl, ck) => {
          // Use a prefix for custom attributes to avoid collisions with existing columns
          // @ts-expect-error ???
          res[`${customAttributePrefix}${cl}`] = obj[k]?.[ck];
        });
      } else {
        continue;
      }
    } else {
      flattenJSON(obj[k], res, `${extraKey}${k}.`, customAttributeLabels);
    }
  }

  return res;
};
