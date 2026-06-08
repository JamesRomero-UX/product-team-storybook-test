import { describe, expect, it } from 'vitest';

import type { CustomAttributeSchemaData } from './export';
import { flattenJSON, getCustomAttributeLabels } from './exportUtils';

describe('getCustomAttributeLabels', () => {
  it('should return empty object if customAttributeSchema is null or undefined', () => {
    expect(getCustomAttributeLabels(null)).toEqual({});
    expect(getCustomAttributeLabels(undefined)).toEqual({});
  });

  it('should extract labels correctly from customAttributeSchema', () => {
    const mockSchema: CustomAttributeSchemaData = {
      Schema: {
        type: 'object',
        properties: {
          risk_level: { type: 'string' },
          priority: { type: 'string' },
        },
      },
      UiSchema: {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Control',
            scope: '#/properties/risk_level',
            label: 'Risk Level',
          },
          {
            type: 'Control',
            scope: '#/properties/priority',
            label: 'Priority Status',
          },
        ],
      },
      Id: 'test-schema-id',
    };

    const result = getCustomAttributeLabels(mockSchema);

    expect(result).toEqual({
      risk_level: 'Risk Level',
      priority: 'Priority Status',
    });
  });

  it('should throw error if control not found for property', () => {
    const mockSchema: CustomAttributeSchemaData = {
      Schema: {
        type: 'object',
        properties: {
          risk_level: { type: 'string' },
          priority: { type: 'string' },
        },
      },
      UiSchema: {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Control',
            scope: '#/properties/risk_level',
            label: 'Risk Level',
          },
          // Missing control for 'priority'
        ],
      },
      Id: 'test-schema-id',
    };

    expect(() => getCustomAttributeLabels(mockSchema)).toThrow(
      'No control found for priority'
    );
  });

  it('should throw error if label not found for control', () => {
    const mockSchema: CustomAttributeSchemaData = {
      Schema: {
        type: 'object',
        properties: {
          risk_level: { type: 'string' },
        },
      },
      UiSchema: {
        type: 'VerticalLayout',
        elements: [
          { type: 'Control', scope: '#/properties/risk_level' }, // Missing label
        ],
      },
      Id: 'test-schema-id',
    };

    expect(() => getCustomAttributeLabels(mockSchema)).toThrow(
      'No label found for control risk_level'
    );
  });
});

describe('flattenJSON', () => {
  it('should flatten a simple object', () => {
    const input = {
      name: 'John',
      age: 30,
    };

    const result = flattenJSON(input);

    expect(result).toEqual({
      name: 'John',
      age: 30,
    });
  });

  it('should flatten nested objects', () => {
    const input = {
      name: 'John',
      details: {
        age: 30,
        address: {
          city: 'New York',
          country: 'USA',
        },
      },
    };

    const result = flattenJSON(input);

    expect(result).toEqual({
      name: 'John',
      'details.age': 30,
      'details.address.city': 'New York',
      'details.address.country': 'USA',
    });
  });

  it('should handle null and undefined values', () => {
    const input = {
      name: 'John',
      age: null,
      address: undefined,
    };

    const result = flattenJSON(input);

    expect(result).toEqual({
      name: 'John',
      age: null,
      address: undefined,
    });
  });

  it('should handle arrays as objects', () => {
    const input = {
      name: 'John',
      hobbies: ['reading', 'gaming'],
    };

    const result = flattenJSON(input);

    expect(result).toEqual({
      name: 'John',
      'hobbies.0': 'reading',
      'hobbies.1': 'gaming',
    });
  });

  it('should handle CustomAttributeData with labels', () => {
    const input = {
      name: 'John',
      CustomAttributeData: {
        risk_level: 'High',
        priority: 'Urgent',
      },
    };

    const customAttributeLabels = {
      risk_level: 'Risk Level',
      priority: 'Priority Status',
    };

    const result = flattenJSON(input, {}, '', customAttributeLabels);

    expect(result).toEqual({
      name: 'John',
      'CA_Risk Level': 'High',
      'CA_Priority Status': 'Urgent',
    });
  });

  it('should ignore CustomAttributeData when no labels provided', () => {
    const input = {
      name: 'John',
      CustomAttributeData: {
        risk_level: 'High',
        priority: 'Urgent',
      },
    };

    const result = flattenJSON(input);

    expect(result).toEqual({
      name: 'John',
    });
  });

  it('should use custom prefix for CustomAttributeData', () => {
    const input = {
      name: 'John',
      CustomAttributeData: {
        risk_level: 'High',
      },
    };

    const customAttributeLabels = {
      risk_level: 'Risk Level',
    };

    const result = flattenJSON(input, {}, '', customAttributeLabels, 'Custom_');

    expect(result).toEqual({
      name: 'John',
      'Custom_Risk Level': 'High',
    });
  });

  it('should handle complex nested structure with CustomAttributeData', () => {
    const input = {
      id: '123',
      user: {
        name: 'John',
        contact: {
          email: 'john@example.com',
        },
      },
      CustomAttributeData: {
        department: 'Engineering',
        level: 'Senior',
      },
    };

    const customAttributeLabels = {
      department: 'Department',
      level: 'Level',
    };

    const result = flattenJSON(input, {}, '', customAttributeLabels);

    expect(result).toEqual({
      id: '123',
      'user.name': 'John',
      'user.contact.email': 'john@example.com',
      CA_Department: 'Engineering',
      CA_Level: 'Senior',
    });
  });

  it('should only include CustomAttributeData fields that have labels', () => {
    const input = {
      name: 'John',
      CustomAttributeData: {
        risk_level: 'High',
        priority: 'Urgent',
        unlabeled: 'Value',
      },
    };

    const customAttributeLabels = {
      risk_level: 'Risk Level',
      priority: 'Priority Status',
      // No label for 'unlabeled'
    };

    const result = flattenJSON(input, {}, '', customAttributeLabels);

    expect(result).toEqual({
      name: 'John',
      'CA_Risk Level': 'High',
      'CA_Priority Status': 'Urgent',
      // 'unlabeled' should not be included
    });
  });
});
