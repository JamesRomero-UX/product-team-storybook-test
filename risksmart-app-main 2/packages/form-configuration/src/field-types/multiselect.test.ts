import { describe, expect, it } from 'vitest';

import { multiselect } from './multiselect';
import type { PutCustomFieldData } from './types';
import { JsonSchemaType } from './types';

describe('Mutiselect toJsonSchema', () => {
  const data: PutCustomFieldData = {
    IsCustomField: true,
    Options: [],
    Label: 'Multiselect',
    Description: undefined,
  };

  it('returns empty enum array when Options is empty', () => {
    const result = multiselect.toJsonSchema({ ...data, Options: [] });
    expect(result).toEqual({
      type: JsonSchemaType.Array,
      uniqueItems: true,
      enum: [],
    });
  });

  it('returns oneOf when any option has _tag AltValueOption', () => {
    const result = multiselect.toJsonSchema({
      ...data,
      Options: [
        { _tag: 'AltValueOption', AltValue: 'risk-1', Value: 'Risk 1' },
        { _tag: 'StringOption', Value: 'Risk 2' },
      ],
    });

    expect(result).toEqual({
      type: 'array',
      uniqueItems: true,
      oneOf: [
        { const: 'risk-1', title: 'Risk 1' },
        { const: 'Risk 2', title: 'Risk 2' },
      ],
    });
  });

  it('returns enum with unique values when all options are StringOption', () => {
    const result = multiselect.toJsonSchema({
      ...data,
      Options: [
        { _tag: 'StringOption', Value: 'Risk 1' },
        { _tag: 'StringOption', Value: 'Risk 2' },
        { _tag: 'StringOption', Value: 'Risk 1' }, // duplicate
        { _tag: 'StringOption', Value: '' }, // falsy value
      ],
    });

    expect(result).toEqual({
      type: JsonSchemaType.Array,
      uniqueItems: true,
      enum: ['Risk 1', 'Risk 2'],
    });
  });

  it('filters out falsy values from enum', () => {
    const result = multiselect.toJsonSchema({
      ...data,
      Options: [
        { _tag: 'StringOption', Value: '' },
        { _tag: 'StringOption', Value: 'Valid' },
      ],
    });

    expect(result).toEqual({
      type: JsonSchemaType.Array,
      uniqueItems: true,
      enum: ['Valid'],
    });
  });

  it('handles Options with only AltValueOption', () => {
    const result = multiselect.toJsonSchema({
      ...data,
      Options: [
        { _tag: 'AltValueOption', AltValue: 'risk-1', Value: 'Risk 1' },
        { _tag: 'AltValueOption', AltValue: 'risk-2', Value: 'Risk 2' },
      ],
    });

    expect(result).toEqual({
      type: JsonSchemaType.Array,
      uniqueItems: true,
      oneOf: [
        { const: 'risk-1', title: 'Risk 1' },
        { const: 'risk-2', title: 'Risk 2' },
      ],
    });
  });
});
