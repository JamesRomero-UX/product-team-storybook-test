import _ from 'lodash';

import { type FieldTypeConfig, JsonSchemaType } from './types';

export const select: FieldTypeConfig = {
  toJsonSchema: (data) => {
    if (!data.Options || data.Options.length === 0) {
      return {
        type: JsonSchemaType.String,
        enum: [],
      };
    }

    if (data.Options.find((o) => o._tag === 'AltValueOption')) {
      // if any of the options have an explicit key, we use oneOf
      return {
        type: JsonSchemaType.String,
        oneOf: data.Options.map((o) => ({
          const: o._tag === 'AltValueOption' ? o.AltValue : o.Value,
          title: o.Value,
        })),
      };
    }

    return {
      type: JsonSchemaType.String,
      enum: _.uniq(data.Options?.map((o) => o.Value)).filter((item) => item),
    };
  },
};
