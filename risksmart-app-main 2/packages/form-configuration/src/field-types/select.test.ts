import { describe, expect, it } from 'vitest';

import { select } from './select';
import type { PutCustomFieldData } from './types';
import { JsonSchemaType } from './types';

describe('select.toJsonSchema', () => {
  const data: PutCustomFieldData = {
    IsCustomField: true,
    Options: [],
    Label: 'Select',
    Description: undefined,
  };

  it('returns enum with empty array if Options is empty', () => {
    const result = select.toJsonSchema({ ...data, Options: [] });
    expect(result).toEqual({
      type: JsonSchemaType.String,
      enum: [],
    });
  });

  it('returns oneOf if any option has _tag AltValueOption', () => {
    const result = select.toJsonSchema({
      ...data,
      Options: [
        { _tag: 'AltValueOption', AltValue: 'foo', Value: 'Foo' },
        { _tag: 'StringOption', Value: 'Bar' },
      ],
    });

    expect(result).toEqual({
      type: JsonSchemaType.String,
      oneOf: [
        { const: 'foo', title: 'Foo' },
        { const: 'Bar', title: 'Bar' },
      ],
    });
  });

  it('returns enum of unique values if no AltValueOption', () => {
    const result = select.toJsonSchema({
      ...data,
      Options: [
        { _tag: 'StringOption', Value: 'A' },
        { _tag: 'StringOption', Value: 'B' },
        { _tag: 'StringOption', Value: 'A' },
      ],
    });

    expect(result).toEqual({
      type: JsonSchemaType.String,
      enum: ['A', 'B'],
    });
  });

  it('filters out falsy values from enum', () => {
    const result = select.toJsonSchema({
      ...data,
      Options: [
        { _tag: 'StringOption', Value: 'A' },
        { _tag: 'StringOption', Value: '' },
      ],
    });

    expect(result).toEqual({
      type: JsonSchemaType.String,
      enum: ['A'],
    });
  });

  it('handles Options with only AltValueOption', () => {
    const result = select.toJsonSchema({
      ...data,
      Options: [
        { _tag: 'AltValueOption', AltValue: 'x', Value: 'X' },
        { _tag: 'AltValueOption', AltValue: 'y', Value: 'Y' },
      ],
    });

    expect(result).toEqual({
      type: JsonSchemaType.String,
      oneOf: [
        { const: 'x', title: 'X' },
        { const: 'y', title: 'Y' },
      ],
    });
  });
});
