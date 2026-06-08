import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildCustomFieldIdLookup,
  createDataItem,
  createFieldConfigMap,
  createMetadataItem,
  DATA_KEY_REGEX,
  extractLabelsFromUISchema,
  type FieldConfigRecord,
  parseCustomFieldKey,
  resolveCustomFieldDefaults,
  type SchemaProperty,
  type UISchemaElement,
  validateCustomFieldConfig,
  validateCustomFieldValueByKind,
} from './custom-fields';

vi.mock('./logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('custom-fields utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DATA_KEY_REGEX', () => {
    it('should match valid custom field keys', () => {
      const validKeys = [
        '1234567890123_text',
        '9876543210987_number',
        '1111111111111_select-option',
        '2222222222222_multi_choice',
      ];

      for (const key of validKeys) {
        const match = DATA_KEY_REGEX.exec(key);
        expect(match).not.toBeNull();
        expect(match?.groups?.id).toBeDefined();
        expect(match?.groups?.kind).toBeDefined();
      }
    });

    it('should not match invalid custom field keys', () => {
      const invalidKeys = [
        'invalidKey',
        '123_text', // ID too short
        'text_1234567890123', // wrong order
        '1234567890123_', // missing kind
        '_text', // missing ID
      ];

      for (const key of invalidKeys) {
        const match = DATA_KEY_REGEX.exec(key);
        expect(match?.groups?.id && match?.groups?.kind).toBeFalsy();
      }
    });

    it('should match keys with uppercase letters (case insensitive)', () => {
      const match = DATA_KEY_REGEX.exec('1234567890123_Text');
      expect(match?.groups?.id).toBe('1234567890123');
      expect(match?.groups?.kind).toBe('Text');
    });
  });

  describe('parseCustomFieldKey', () => {
    it('should parse valid custom field key', () => {
      const result = parseCustomFieldKey('1234567890123_text');

      expect(result).toEqual({
        id: '1234567890123',
        kind: 'text',
      });
    });

    it('should parse custom field key with hyphenated kind', () => {
      const result = parseCustomFieldKey('1234567890123_multi-select');

      expect(result).toEqual({
        id: '1234567890123',
        kind: 'multi-select',
      });
    });

    it('should return null for invalid key', () => {
      const result = parseCustomFieldKey('invalidKey');

      expect(result).toBeNull();
    });

    it('should return null for key with short ID', () => {
      const result = parseCustomFieldKey('123_text');

      expect(result).toBeNull();
    });
  });

  describe('extractLabelsFromUISchema', () => {
    it('should extract labels from valid UI schema elements', () => {
      const elements: UISchemaElement[] = [
        {
          type: 'Control',
          label: 'First Name',
          scope: '#/properties/1234567890123_first_name',
        },
        {
          type: 'Control',
          label: 'Last Name',
          scope: '#/properties/1234567890124_last_name',
        },
      ];

      const result = extractLabelsFromUISchema(elements);

      expect(result.size).toBe(2);
      expect(result.get('1234567890123_first_name')).toBe('First Name');
      expect(result.get('1234567890124_last_name')).toBe('Last Name');
    });

    it('should skip elements without labels', () => {
      const elements: UISchemaElement[] = [
        {
          type: 'Control',
          scope: '#/properties/1234567890123_field',
        },
      ];

      const result = extractLabelsFromUISchema(elements);

      expect(result.size).toBe(0);
    });

    it('should skip non-Control elements', () => {
      const elements = [
        {
          type: 'VerticalLayout',
          label: 'Should be ignored',
          scope: '#/properties/1234567890123_field',
        },
      ];

      const result = extractLabelsFromUISchema(elements);

      expect(result.size).toBe(0);
    });

    it('should skip elements with scope not starting with #/properties/', () => {
      const elements: UISchemaElement[] = [
        {
          type: 'Control',
          label: 'Field Label',
          scope: '#/definitions/1234567890123_field',
        },
      ];

      const result = extractLabelsFromUISchema(elements);

      expect(result.size).toBe(0);
    });

    it('should return empty map for non-array input', () => {
      const result = extractLabelsFromUISchema('not an array');

      expect(result.size).toBe(0);
    });

    it('should return empty map for null input', () => {
      const result = extractLabelsFromUISchema(null);

      expect(result.size).toBe(0);
    });
  });

  describe('createFieldConfigMap', () => {
    it('should create map from field configs', () => {
      const fieldsConfig: FieldConfigRecord[] = [
        {
          FieldId: 'CustomAttributeData.1234567890123_text',
          Hidden: false,
          Required: true,
          ReadOnly: false,
          DefaultValue: null,
        },
        {
          FieldId: 'CustomAttributeData.1234567890124_number',
          Hidden: false,
          Required: false,
          ReadOnly: true,
          DefaultValue: 42,
        },
      ];

      const result = createFieldConfigMap(fieldsConfig);

      expect(result.size).toBe(2);
      expect(result.get('1234567890123_text')).toEqual(fieldsConfig[0]);
      expect(result.get('1234567890124_number')).toEqual(fieldsConfig[1]);
    });

    it('should skip fields without CustomAttributeData prefix', () => {
      const fieldsConfig: FieldConfigRecord[] = [
        {
          FieldId: 'CustomAttributeData.1234567890123_text',
          Hidden: false,
          Required: true,
          ReadOnly: false,
          DefaultValue: null,
        },
        {
          FieldId: 'SomeOtherPrefix.1234567890124_number',
          Hidden: false,
          Required: false,
          ReadOnly: false,
          DefaultValue: null,
        },
      ];

      const result = createFieldConfigMap(fieldsConfig);

      expect(result.size).toBe(1);
      expect(result.has('1234567890123_text')).toBe(true);
      expect(result.has('1234567890124_number')).toBe(false);
    });

    it('should handle empty array', () => {
      const result = createFieldConfigMap([]);

      expect(result.size).toBe(0);
    });
  });

  describe('createDataItem', () => {
    it('should create data item with label', () => {
      const result = createDataItem('123', 'test value', 'Test Label');

      expect(result).toEqual({
        id: '123',
        value: 'test value',
        label: 'Test Label',
      });
      expect(Object.isFrozen(result)).toBe(true);
    });

    it('should create data item without label', () => {
      const result = createDataItem('123', 'test value');

      expect(result).toEqual({
        id: '123',
        value: 'test value',
      });
      expect(Object.isFrozen(result)).toBe(true);
    });

    it('should create data item with undefined label (no label property)', () => {
      const result = createDataItem('123', 'test value', undefined);

      expect(result).toEqual({
        id: '123',
        value: 'test value',
      });
      expect(result).not.toHaveProperty('label');
    });

    it('should preserve value types', () => {
      expect(createDataItem('1', 42).value).toBe(42);
      expect(createDataItem('2', true).value).toBe(true);
      expect(createDataItem('3', null).value).toBeNull();
      expect(createDataItem('4', ['a', 'b']).value).toEqual(['a', 'b']);
    });
  });

  describe('createMetadataItem', () => {
    it('should create metadata item with all properties', () => {
      const schemaProp: SchemaProperty = {
        description: 'A test field',
        enum: ['option1', 'option2'],
        format: 'email',
        uniqueItems: true,
      };

      const fieldConfig: FieldConfigRecord = {
        FieldId: 'CustomAttributeData.123_test',
        Hidden: false,
        Required: true,
        ReadOnly: false,
        DefaultValue: 'default',
      };

      const result = createMetadataItem('test', schemaProp, fieldConfig);

      expect(result).toEqual({
        kind: 'test',
        description: 'A test field',
        hidden: false,
        readOnly: false,
        required: true,
        defaultValue: 'default',
        enum: ['option1', 'option2'],
        format: 'email',
        uniqueItems: true,
      });
      expect(Object.isFrozen(result)).toBe(true);
    });

    it('should handle missing optional properties', () => {
      const schemaProp: SchemaProperty = {};

      const fieldConfig: FieldConfigRecord = {
        FieldId: 'CustomAttributeData.123_test',
        Hidden: true,
        Required: false,
        ReadOnly: true,
        DefaultValue: null,
      };

      const result = createMetadataItem('test', schemaProp, fieldConfig);

      expect(result).toEqual({
        kind: 'test',
        hidden: true,
        readOnly: true,
        required: false,
        defaultValue: null,
        description: undefined,
        enum: undefined,
        format: undefined,
        uniqueItems: undefined,
      });
    });
  });

  describe('buildCustomFieldIdLookup', () => {
    const makeFieldConfig = (propKey: string): FieldConfigRecord => ({
      FieldId: `CustomAttributeData.${propKey}`,
      Hidden: false,
      Required: false,
      ReadOnly: false,
      DefaultValue: null,
    });

    it('returns map with correct entries', () => {
      const propKey = '1234567890123_text';
      const schemaProp = { enum: ['a', 'b'] };
      const props = { [propKey]: schemaProp };
      const fieldConfig = makeFieldConfig(propKey);
      const fieldConfigMap = new Map([[propKey, fieldConfig]]);

      const result = buildCustomFieldIdLookup(props, fieldConfigMap);

      expect(result.size).toBe(1);
      const entry = result.get('1234567890123');
      expect(entry).toEqual({
        propKey,
        kind: 'text',
        schemaProp,
        fieldConfig,
      });
    });

    it('skips keys that do not match the id_kind regex', () => {
      const props = { notAValidKey: {}, '1234567890123_text': {} };
      const fieldConfigMap = new Map<string, FieldConfigRecord>();

      const result = buildCustomFieldIdLookup(props, fieldConfigMap);

      expect(result.has('notAValidKey')).toBe(false);
      expect(result.size).toBe(1);
    });

    it('sets fieldConfig to undefined when not in fieldConfigMap', () => {
      const propKey = '1234567890123_text';
      const props = { [propKey]: {} };
      const fieldConfigMap = new Map<string, FieldConfigRecord>();

      const result = buildCustomFieldIdLookup(props, fieldConfigMap);

      expect(result.get('1234567890123')?.fieldConfig).toBeUndefined();
    });
  });

  describe('validateCustomFieldValueByKind', () => {
    const throwMockFn = vi.fn((msg: string): void => {
      throw new Error(msg);
    });

    beforeEach(() => {
      throwMockFn.mockClear();
    });

    it('null value: all kinds should throw an error', () => {
      const kind = [
        'text',
        'select',
        'boolean',
        'number',
        'integer',
        'date',
        'link',
        'multiselect',
        'usermultiselect',
      ];
      kind.forEach((kind) => {
        expect(() =>
          validateCustomFieldValueByKind('id1', kind, null, {
            schemaProp: {},
            throwValidationError: throwMockFn,
          })
        ).toThrow();
      });
      expect(throwMockFn).toHaveBeenCalledTimes(kind.length);
    });

    it('text: string is valid', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'text', 'hello', {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).not.toThrow();
    });

    it('text: non-string throws', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'text', 42, {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).toThrow('Expected string, received number');
    });

    it('select: valid enum value is valid', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'select', 'a', {
          schemaProp: { enum: ['a', 'b'] },
          throwValidationError: throwMockFn,
        })
      ).not.toThrow();
    });

    it('select: non-enum value throws', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'select', 'c', {
          schemaProp: { enum: ['a', 'b'] },
          throwValidationError: throwMockFn,
        })
      ).toThrow('Invalid enum value');
    });

    it('boolean: true/false are valid', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'boolean', true, {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).not.toThrow();
      expect(() =>
        validateCustomFieldValueByKind('id1', 'boolean', false, {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).not.toThrow();
    });

    it('boolean: string throws', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'boolean', 'true', {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).toThrow('Expected boolean, received string');
    });

    it('number: number is valid', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'number', 3.14, {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).not.toThrow();
    });

    it('number: string throws', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'number', '3.14', {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).toThrow('Expected number, received string');
    });

    it('integer: number is valid', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'integer', 5, {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).not.toThrow();
    });

    it('integer: string throws', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'integer', '5', {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).toThrow('Expected number, received string');
    });

    it('integer: float throws', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'integer', 3.14, {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).toThrow('Expected integer, received float');
    });

    it('date: valid ISO string is valid', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'date', '2024-03-15T09:00:00Z', {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).not.toThrow();
    });

    it('date: invalid date string throws', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'date', 'not-a-date', {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).toThrow('Invalid datetime');
    });

    it('date: date-only string "2024-01-15" throws', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'date', '2024-01-15', {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).toThrow('Invalid datetime');
    });

    it('date: non-string throws', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'date', 12345, {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).toThrow('Expected string, received number');
    });

    it('link: valid URL is valid', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'link', 'https://example.com', {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).not.toThrow();
    });

    it('link: malformed URL throws', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'link', 'not a url', {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).toThrow('Invalid url');
    });

    it('link: non-string throws', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'link', 42, {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).toThrow('Expected string, received number');
    });

    it('multiselect: string array is valid', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'multiselect', ['a', 'b'], {
          schemaProp: { enum: ['a', 'b', 'c'] },
          throwValidationError: throwMockFn,
        })
      ).not.toThrow();
    });

    it('multiselect: non-array throws', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'multiselect', 'a', {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).toThrow('Expected array, received string');
    });

    it('multiselect: unknown enum values throw', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'multiselect', ['a', 'z'], {
          schemaProp: { enum: ['a', 'b'] },
          throwValidationError: throwMockFn,
        })
      ).toThrow('Invalid enum value');
    });

    // Note: usermultiselect/departmentmultiselect are handled before this
    // function is called (in schema.service.ts) and never reach buildKindSchema.
    it('unknown kind: calls throwValidationError', () => {
      expect(() =>
        validateCustomFieldValueByKind('id1', 'unknownkind', 'anything', {
          schemaProp: {},
          throwValidationError: throwMockFn,
        })
      ).toThrow();
    });

    it('throwValidationError is called with correct message', () => {
      const throwSpy = vi.fn((_msg: string): never => {
        throw new Error(_msg);
      });
      expect(() =>
        validateCustomFieldValueByKind('id1', 'text', 123, {
          schemaProp: {},
          throwValidationError: throwSpy,
        })
      ).toThrow();
      expect(throwSpy).toHaveBeenCalledWith(
        'Custom field id1 (text): Expected string, received number'
      );
    });
  });

  describe('resolveCustomFieldDefaults', () => {
    const makeConfig = (
      propKey: string,
      overrides: Partial<FieldConfigRecord> = {}
    ): FieldConfigRecord => ({
      FieldId: `CustomAttributeData.${propKey}`,
      Hidden: false,
      Required: false,
      ReadOnly: false,
      DefaultValue: null,
      ...overrides,
    });

    const propKey1 = '1234567890123_text';
    const id1 = '1234567890123';

    it('isCreate=true, required field missing - missingRequiredIds set', () => {
      const props = { [propKey1]: {} };
      const fieldConfigMap = new Map([
        [propKey1, makeConfig(propKey1, { Required: true })],
      ]);
      const result = resolveCustomFieldDefaults(
        props,
        fieldConfigMap,
        new Set(),
        true
      );
      expect(result.missingRequiredIds).toEqual([id1]);
    });

    it('isCreate=true, required field with DefaultValue - not missing, added to defaults', () => {
      const props = { [propKey1]: {} };
      const fieldConfigMap = new Map([
        [
          propKey1,
          makeConfig(propKey1, { Required: true, DefaultValue: 'fallback' }),
        ],
      ]);
      const result = resolveCustomFieldDefaults(
        props,
        fieldConfigMap,
        new Set(),
        true
      );
      expect(result.missingRequiredIds).toEqual([]);
      expect(result.defaults[propKey1]).toBe('fallback');
    });

    it('isCreate=true, required field in customFieldIds - no missing', () => {
      const props = { [propKey1]: {} };
      const fieldConfigMap = new Map([
        [propKey1, makeConfig(propKey1, { Required: true })],
      ]);
      const result = resolveCustomFieldDefaults(
        props,
        fieldConfigMap,
        new Set([id1]),
        true
      );
      expect(result.missingRequiredIds).toEqual([]);
    });

    it('isCreate=true, defaultValue set, field not in input - in defaults', () => {
      const props = { [propKey1]: {} };
      const fieldConfigMap = new Map([
        [propKey1, makeConfig(propKey1, { DefaultValue: 'myDefault' })],
      ]);
      const result = resolveCustomFieldDefaults(
        props,
        fieldConfigMap,
        new Set(),
        true
      );
      expect(result.defaults[propKey1]).toBe('myDefault');
    });

    it('isCreate=true, defaultValue set, field in input - NOT in defaults', () => {
      const props = { [propKey1]: {} };
      const fieldConfigMap = new Map([
        [propKey1, makeConfig(propKey1, { DefaultValue: 'myDefault' })],
      ]);
      const result = resolveCustomFieldDefaults(
        props,
        fieldConfigMap,
        new Set([id1]),
        true
      );
      expect(result.defaults).not.toHaveProperty(propKey1);
    });

    it('isCreate=false - no required check, no defaults', () => {
      const props = { [propKey1]: {} };
      const fieldConfigMap = new Map([
        [
          propKey1,
          makeConfig(propKey1, { Required: true, DefaultValue: 'val' }),
        ],
      ]);
      const result = resolveCustomFieldDefaults(
        props,
        fieldConfigMap,
        new Set(),
        false
      );
      expect(result.missingRequiredIds).toEqual([]);
      expect(result.defaults).toEqual({});
    });

    it('props with non-matching key regex - skipped', () => {
      const props = { notAValidKey: {} };
      const fieldConfigMap = new Map<string, FieldConfigRecord>();
      const result = resolveCustomFieldDefaults(
        props,
        fieldConfigMap,
        new Set(),
        true
      );
      expect(result.missingRequiredIds).toEqual([]);
      expect(result.defaults).toEqual({});
    });

    it('props with no fieldConfigMap entry - skipped', () => {
      const props = { [propKey1]: {} };
      const fieldConfigMap = new Map<string, FieldConfigRecord>();
      const result = resolveCustomFieldDefaults(
        props,
        fieldConfigMap,
        new Set(),
        true
      );
      expect(result.missingRequiredIds).toEqual([]);
      expect(result.defaults).toEqual({});
    });

    it('isCreate=true, multiple required fields missing - all IDs returned', () => {
      const propKey2 = '1234567890124_number';
      const id2 = '1234567890124';
      const props = { [propKey1]: {}, [propKey2]: {} };
      const fieldConfigMap = new Map([
        [propKey1, makeConfig(propKey1, { Required: true })],
        [propKey2, makeConfig(propKey2, { Required: true })],
      ]);
      const result = resolveCustomFieldDefaults(
        props,
        fieldConfigMap,
        new Set(),
        true
      );
      expect(result.missingRequiredIds).toEqual([id1, id2]);
    });
  });

  describe('validateCustomFieldConfig', () => {
    const validParsedKey = { id: '123', kind: 'text' };
    const validFieldConfig: FieldConfigRecord = {
      FieldId: 'CustomAttributeData.123_test',
      Hidden: false,
      Required: true,
      ReadOnly: false,
      DefaultValue: null,
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return true for valid config', () => {
      const result = validateCustomFieldConfig({
        propKey: '123_test',
        rawValue: 'value',
        parsedKey: validParsedKey,
        fieldConfig: validFieldConfig,
      });

      expect(result).toBe(true);
    });

    it('should return false and warn for null parsed key', async () => {
      const { logger } = await import('./logger');

      const result = validateCustomFieldConfig({
        propKey: 'invalidKey',
        rawValue: 'value',
        parsedKey: null,
        fieldConfig: validFieldConfig,
      });

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({ propKey: 'invalidKey' }),
        expect.stringContaining('key did not match signature')
      );
    });

    it('should return false and warn for undefined field config', async () => {
      const { logger } = await import('./logger');

      const result = validateCustomFieldConfig({
        propKey: '123_test',
        rawValue: 'value',
        parsedKey: validParsedKey,
        fieldConfig: undefined,
      });

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({ propKey: '123_test' }),
        expect.stringContaining('no fields_config entry')
      );
    });
  });
});
