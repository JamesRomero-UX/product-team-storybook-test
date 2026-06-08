import { describe, expect, it } from 'vitest';

import {
  fieldEditorSchema,
  isOptionFieldType,
  sectionEditorSchema,
} from './config';

describe('isOptionFieldType', () => {
  it('returns true for radio', () => {
    expect(isOptionFieldType('radio')).toBe(true);
  });

  it('returns true for dropdown', () => {
    expect(isOptionFieldType('dropdown')).toBe(true);
  });

  it('returns true for multiselect', () => {
    expect(isOptionFieldType('multiselect')).toBe(true);
  });

  it('returns false for text', () => {
    expect(isOptionFieldType('text')).toBe(false);
  });

  it('returns false for textArea', () => {
    expect(isOptionFieldType('textArea')).toBe(false);
  });

  it('returns false for number', () => {
    expect(isOptionFieldType('number')).toBe(false);
  });

  it('returns false for url', () => {
    expect(isOptionFieldType('url')).toBe(false);
  });

  it('returns false for date', () => {
    expect(isOptionFieldType('date')).toBe(false);
  });

  it('returns false for an unknown type', () => {
    expect(isOptionFieldType('unknown')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isOptionFieldType('')).toBe(false);
  });
});

describe('sectionEditorSchema', () => {
  it('rejects missing name', () => {
    const result = sectionEditorSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Name is required');
    }
  });

  it('accepts a valid minimal section', () => {
    const result = sectionEditorSchema.safeParse({ name: 'My Section' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('My Section');
      expect(result.data.conditionalLogicEnabled).toBe(false);
      expect(result.data.conditionalLogicRules).toEqual([]);
      expect(result.data.guidanceEnabled).toBe(false);
    }
  });

  it('accepts a section with all optional fields', () => {
    const result = sectionEditorSchema.safeParse({
      name: 'Full Section',
      description: 'A description',
      conditionalLogicEnabled: true,
      conditionalLogicRules: [
        { ifField: 'field-1', values: ['val'], showField: 'section-1' },
      ],
      guidanceEnabled: true,
      guidance: '<p>Some guidance</p>',
    });
    expect(result.success).toBe(true);
  });

  it('rejects conditional logic rules with empty ifField', () => {
    const result = sectionEditorSchema.safeParse({
      name: 'Section',
      conditionalLogicRules: [
        { ifField: '', values: [], showField: 'section-1' },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects conditional logic rules with empty showField', () => {
    const result = sectionEditorSchema.safeParse({
      name: 'Section',
      conditionalLogicRules: [
        { ifField: 'field-1', values: [], showField: '' },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe('fieldEditorSchema', () => {
  const validField = {
    fieldType: 'text',
    fieldName: 'My Field',
    required: false,
    readOnly: false,
    options: [],
  };

  it('accepts a valid text field', () => {
    const result = fieldEditorSchema.safeParse(validField);
    expect(result.success).toBe(true);
  });

  it('rejects missing fieldName', () => {
    const result = fieldEditorSchema.safeParse({
      ...validField,
      fieldName: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameIssue = result.error.issues.find((i) =>
        i.path.includes('fieldName')
      );
      expect(nameIssue?.message).toBe('Field name is required');
    }
  });

  it('rejects missing fieldType', () => {
    const result = fieldEditorSchema.safeParse({
      ...validField,
      fieldType: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const typeIssue = result.error.issues.find((i) =>
        i.path.includes('fieldType')
      );
      expect(typeIssue?.message).toBe('Field type is required');
    }
  });

  it('rejects radio type with fewer than 2 options', () => {
    const result = fieldEditorSchema.safeParse({
      ...validField,
      fieldType: 'radio',
      options: [{ id: 'opt-1', label: 'Option 1' }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const optIssue = result.error.issues.find((i) =>
        i.path.includes('options')
      );
      expect(optIssue?.message).toBe('At least 2 options are required');
    }
  });

  it('rejects dropdown type with zero options', () => {
    const result = fieldEditorSchema.safeParse({
      ...validField,
      fieldType: 'dropdown',
      options: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects multiselect type with fewer than 2 options', () => {
    const result = fieldEditorSchema.safeParse({
      ...validField,
      fieldType: 'multiselect',
      options: [{ id: 'opt-1', label: 'A' }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts radio type with 2+ unique options', () => {
    const result = fieldEditorSchema.safeParse({
      ...validField,
      fieldType: 'radio',
      options: [
        { id: 'opt-1', label: 'Option A' },
        { id: 'opt-2', label: 'Option B' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects radio type with duplicate option labels', () => {
    const result = fieldEditorSchema.safeParse({
      ...validField,
      fieldType: 'radio',
      options: [
        { id: 'opt-1', label: 'Same' },
        { id: 'opt-2', label: 'Same' },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.message === 'Option labels must be unique'
      );
      expect(dupIssue).toBeDefined();
    }
  });

  it('rejects radio type with duplicate labels (case-insensitive)', () => {
    const result = fieldEditorSchema.safeParse({
      ...validField,
      fieldType: 'radio',
      options: [
        { id: 'opt-1', label: 'Foo' },
        { id: 'opt-2', label: 'foo' },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects radio type with duplicate labels (trimmed whitespace)', () => {
    const result = fieldEditorSchema.safeParse({
      ...validField,
      fieldType: 'radio',
      options: [
        { id: 'opt-1', label: 'Bar' },
        { id: 'opt-2', label: ' Bar ' },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects options with empty label', () => {
    const result = fieldEditorSchema.safeParse({
      ...validField,
      fieldType: 'radio',
      options: [
        { id: 'opt-1', label: '' },
        { id: 'opt-2', label: 'Valid' },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const labelIssue = result.error.issues.find(
        (i) => i.message === 'Option label is required'
      );
      expect(labelIssue).toBeDefined();
    }
  });

  it('does not require options for non-option field types', () => {
    const result = fieldEditorSchema.safeParse({
      ...validField,
      fieldType: 'text',
      options: [],
    });
    expect(result.success).toBe(true);
  });

  it('defaults required and readOnly to false', () => {
    const result = fieldEditorSchema.safeParse({
      fieldType: 'text',
      fieldName: 'Test',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.required).toBe(false);
      expect(result.data.readOnly).toBe(false);
    }
  });

  it('defaults conditionalLogicEnabled and guidanceEnabled to false', () => {
    const result = fieldEditorSchema.safeParse({
      fieldType: 'text',
      fieldName: 'Test',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.conditionalLogicEnabled).toBe(false);
      expect(result.data.guidanceEnabled).toBe(false);
    }
  });
});
