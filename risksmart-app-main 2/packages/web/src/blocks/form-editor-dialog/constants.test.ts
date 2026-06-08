import { describe, expect, it } from 'vitest';

import type { FieldEditorValues, SectionEditorValues } from './config';
import {
  buildFieldDefaults,
  buildSectionDefaults,
  type FieldSummary,
  getFieldTypeLabel,
} from './constants';

describe('getFieldTypeLabel', () => {
  it('returns "Text" for text', () => {
    expect(getFieldTypeLabel('text')).toBe('Text');
  });

  it('returns "Text Area" for textArea', () => {
    expect(getFieldTypeLabel('textArea')).toBe('Text Area');
  });

  it('returns "Number" for number', () => {
    expect(getFieldTypeLabel('number')).toBe('Number');
  });

  it('returns "Link" for url', () => {
    expect(getFieldTypeLabel('url')).toBe('Link');
  });

  it('returns "Date" for date', () => {
    expect(getFieldTypeLabel('date')).toBe('Date');
  });

  it('returns "Radio" for radio', () => {
    expect(getFieldTypeLabel('radio')).toBe('Radio');
  });

  it('returns "Dropdown" for dropdown', () => {
    expect(getFieldTypeLabel('dropdown')).toBe('Dropdown');
  });

  it('returns "Multiselect" for multiselect', () => {
    expect(getFieldTypeLabel('multiselect')).toBe('Multiselect');
  });

  it('returns the raw type string for an unknown type', () => {
    expect(getFieldTypeLabel('custom-widget')).toBe('custom-widget');
  });

  it('returns empty string for empty type', () => {
    expect(getFieldTypeLabel('')).toBe('');
  });
});

describe('buildSectionDefaults', () => {
  const sectionNames: Record<string, string> = {
    'sec-1': 'My Section',
    'sec-2': 'Another',
  };

  const sectionConfigs: Record<string, SectionEditorValues> = {
    'sec-1': {
      name: 'My Section',
      description: 'Desc',
      conditionalLogicEnabled: true,
      conditionalLogicRules: [
        { ifField: 'f1', values: ['v1'], showField: 'sec-2' },
      ],
      guidanceEnabled: false,
      guidance: '',
    },
  };

  it('returns empty defaults when sectionId is null', () => {
    const result = buildSectionDefaults(null, sectionNames, sectionConfigs);
    expect(result).toEqual({
      name: '',
      description: '',
      conditionalLogicEnabled: false,
      conditionalLogicRules: [],
      guidanceEnabled: false,
      guidance: '',
    });
  });

  it('returns existing config when sectionId has a config', () => {
    const result = buildSectionDefaults('sec-1', sectionNames, sectionConfigs);
    expect(result).toBe(sectionConfigs['sec-1']);
  });

  it('returns defaults with name when sectionId has no config but has a name', () => {
    const result = buildSectionDefaults('sec-2', sectionNames, sectionConfigs);
    expect(result.name).toBe('Another');
    expect(result.description).toBe('');
    expect(result.conditionalLogicEnabled).toBe(false);
  });

  it('returns defaults with empty name when sectionId has no config and no name', () => {
    const result = buildSectionDefaults(
      'sec-unknown',
      sectionNames,
      sectionConfigs
    );
    expect(result.name).toBe('');
  });
});

describe('buildFieldDefaults', () => {
  const fields: Record<string, FieldSummary> = {
    'f-1': { name: 'Risk name', type: 'text', required: true, readOnly: false },
    'f-2': {
      name: 'Category',
      type: 'dropdown',
      required: false,
      readOnly: true,
    },
  };

  const fieldConfigs: Record<string, FieldEditorValues> = {
    'f-1': {
      fieldType: 'text',
      fieldName: 'Risk name',
      required: true,
      readOnly: false,
      options: [],
      conditionalLogicEnabled: false,
      conditionalLogicRules: [],
      guidanceEnabled: false,
      guidance: '',
    },
  };

  it('returns empty defaults when fieldId is null', () => {
    const result = buildFieldDefaults(null, fields, fieldConfigs);
    expect(result).toEqual({
      fieldType: 'text',
      fieldName: '',
      required: false,
      readOnly: false,
      options: [],
      conditionalLogicEnabled: false,
      conditionalLogicRules: [],
      guidanceEnabled: false,
      guidance: '',
    });
  });

  it('returns existing config when fieldId has a config', () => {
    const result = buildFieldDefaults('f-1', fields, fieldConfigs);
    expect(result).toBe(fieldConfigs['f-1']);
  });

  it('returns defaults from field summary when fieldId has no config but has a field', () => {
    const result = buildFieldDefaults('f-2', fields, fieldConfigs);
    expect(result.fieldType).toBe('dropdown');
    expect(result.fieldName).toBe('Category');
    expect(result.required).toBe(false);
    expect(result.readOnly).toBe(false);
    expect(result.options).toEqual([]);
  });

  it('returns defaults with empty strings when fieldId has no config and no field', () => {
    const result = buildFieldDefaults('f-unknown', fields, fieldConfigs);
    expect(result.fieldType).toBe('');
    expect(result.fieldName).toBe('');
    expect(result.required).toBe(false);
    expect(result.readOnly).toBe(false);
  });
});
