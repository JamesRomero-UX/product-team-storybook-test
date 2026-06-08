import _ from 'lodash';

import { type FieldTypeConfig, JsonSchemaType } from './types';

export const multiselect: FieldTypeConfig = {
  toJsonSchema: (data) => {
    if (!data.Options || data.Options.length === 0) {
      return {
        type: JsonSchemaType.Array,
        uniqueItems: true,
        enum: [],
      };
    }

    if (data.Options.find((o) => o._tag === 'AltValueOption')) {
      // if any of the options have an alternate value, we use oneOf
      return {
        type: JsonSchemaType.Array,
        uniqueItems: true,
        oneOf: data.Options.map((o) => ({
          const: o._tag === 'AltValueOption' ? o.AltValue : o.Value,
          title: o.Value,
        })),
      };
    }

    return {
      type: JsonSchemaType.Array,
      // https://jsonforms.io/docs/multiple-choice/
      uniqueItems: true,
      enum: _.uniq(data.Options?.map((o) => o.Value)).filter((item) => item),
    };
  },
};
