import { RuleEffect } from '@jsonforms/core';

import type { CustomSchema, CustomUISchema } from './types';
import { FieldOptionType } from './types';
import { emptyPropertyFilterQuery } from './types';

export const emptySchema: CustomSchema = {
  type: 'object',
  properties: {},
  required: [],
};

export const emptyUISchema: CustomUISchema = {
  type: 'VerticalLayout',
  elements: [],
};

export const staleSchema0: CustomSchema = {
  type: 'object',
  properties: {
    'field_stale-multiselect': {
      type: 'string',
      parentId: 'section_random-uuid',
      isCustomisable: true,
      minLength: 0,
      allowAttachments: false,
      oneOf: [
        {
          const: 'option-uuid-0',
          title: 'A',
        },
        {
          const: 'option-uuid-1',
          title: 'B',
        },
        {
          const: 'option-uuid-2',
          title: 'C',
        },
      ],
    },
  },
};

export const staleSchema1: CustomSchema = {
  type: 'object',
  properties: {
    'field_stale-multiselect': {
      type: 'string',
      parentId: 'section_random-uuid',
      isCustomisable: true,
      minLength: 0,
      minItems: 0,
      allowAttachments: false,
      items: {
        oneOf: [
          {
            const: 'option-uuid-0',
            title: 'A',
          },
          {
            const: 'option-uuid-1',
            title: 'B',
          },
          {
            const: 'option-uuid-2',
            title: 'C',
          },
        ],
      },
      oneOf: [
        {
          const: 'option-uuid-3',
          title: 'D',
        },
        {
          const: 'option-uuid-4',
          title: 'E',
        },
        {
          const: 'option-uuid-5',
          title: 'F',
        },
      ],
    },
  },
};

export const nonStaleSchema: CustomSchema = {
  type: 'object',
  required: [],
  properties: {
    'field_valid-multiselect': {
      type: 'array',
      uniqueItems: true,
      parentId: 'section_random-uuid',
      isCustomisable: true,
      isConditional: false,
      minItems: 0,
      allowAttachments: false,
      items: {
        oneOf: [
          {
            const: 'option-uuid-0',
            title: 'A',
          },
          {
            const: 'option-uuid-1',
            title: 'B',
          },
          {
            const: 'option-uuid-2',
            title: 'C',
          },
        ],
      },
    },
  },
};

export const migratedStaleSchema: CustomSchema = {
  type: 'object',
  properties: {
    'field_stale-multiselect': {
      allowAttachments: false,
      isConditional: false,
      conditionalOptions: emptyPropertyFilterQuery,
      isCustomisable: true,
      items: {
        oneOf: [
          {
            const: 'option-uuid-0',
            title: 'A',
          },
          {
            const: 'option-uuid-1',
            title: 'B',
          },
          {
            const: 'option-uuid-2',
            title: 'C',
          },
        ],
      },
      parentId: 'section_random-uuid',
      type: 'array',
      uniqueItems: true,
    },
  },
  required: [],
};

export const staleUISchema: CustomUISchema = {
  type: 'VerticalLayout',
  elements: [
    {
      id: 'section_random-uuid',
      type: 'Group',
      label: 'Section 1',
      elements: [
        {
          id: 'field_stale-multiselect',
          type: 'Control',
          label: 'This is a stale MULTISELECT field',
          parentId: 'section_random-uuid',
          scope: '#/properties/field_stale-multiselect',
          options: {
            description: '',
            placeholder: '',
            fieldType: 'multiselect',
          },
        },
      ],
    },
  ],
};

export const staleSchema2: CustomSchema = {
  type: 'object',
  properties: {
    field1: {
      type: 'string',
      parentId: 'section_random-uuid',
      isCustomisable: true,
      oneOf: [
        { const: 'opt1', title: 'Option 1' },
        { const: 'opt2', title: 'Option 2' },
      ],
    },
    field2: {
      type: 'string',
      parentId: 'section_random-uuid',
      isCustomisable: true,
      isConditional: true,
      conditionalOptions: {
        operation: 'and',
        tokens: [
          {
            propertyKey: 'field1',
            operator: '=',
            value: ['Option 1', 'Option 2'],
          },
        ],
      },
    },
  },
};

export const staleUISchema2: CustomUISchema = {
  type: 'VerticalLayout',
  elements: [
    {
      id: 'section_random-uuid',
      type: 'Group',
      label: 'Section 1',
      elements: [
        {
          id: 'field1',
          type: 'Control',
          label: 'Field 1',
          parentId: 'section_random-uuid',
          scope: '#/properties/field1',
          options: {
            fieldType: FieldOptionType.Dropdown,
          },
        },
        {
          id: 'field2',
          type: 'Control',
          label: 'Field 2',
          parentId: 'section_random-uuid',
          scope: '#/properties/field2',
          options: {
            fieldType: FieldOptionType.Text,
          },
        },
      ],
    },
  ],
};

export const nonStaleUISchema: CustomUISchema = {
  type: 'VerticalLayout',
  elements: [
    {
      id: 'section_random-uuid',
      type: 'Group',
      label: 'Section 1',
      elements: [
        {
          id: 'field_valid-multiselect',
          type: 'Control',
          label: 'This is a stale MULTISELECT field',
          parentId: 'section_random-uuid',
          scope: '#/properties/field_valid-multiselect',
          options: {
            description: '',
            placeholder: '',
            fieldType: 'multiselect',
          },
        },
      ],
    },
  ],
};

export const complexSchema: CustomSchema = {
  type: 'object',
  properties: {
    field1: {
      type: 'string',
      parentId: 'section1',
      isCustomisable: true,
      isConditional: true,
      conditionalOptions: {
        operation: 'and',
        tokens: [
          {
            propertyKey: 'field2',
            operator: '=',
            value: ['opt1', 'opt2'],
          },
          {
            propertyKey: 'field3',
            operator: '=',
            value: ['opt3'],
          },
        ],
      },
    },
    field2: {
      type: 'string',
      parentId: 'section1',
      isCustomisable: true,
      oneOf: [
        { const: 'opt1', title: 'Option 1' },
        { const: 'opt2', title: 'Option 2' },
      ],
    },
    field3: {
      type: 'string',
      parentId: 'section1',
      isCustomisable: true,
      oneOf: [{ const: 'opt3', title: 'Option 3' }],
    },
    field4: {
      type: 'array',
      parentId: 'section1',
      isCustomisable: true,
      items: {
        oneOf: [
          { const: 'opt4', title: 'Option 4' },
          { const: 'opt5', title: 'Option 5' },
        ],
      },
    },
    field5: {
      type: 'string',
      parentId: 'section1',
      isCustomisable: true,
      isConditional: true,
      conditionalOptions: {
        operation: 'and',
        tokens: [
          {
            propertyKey: 'field2',
            operator: '=',
            value: ['opt1', 'opt2'],
          },
        ],
      },
    },
  },
  allOf: [
    {
      if: {
        properties: { field2: { enum: ['opt1', 'opt2'] } },
        required: ['field2'],
      },
      then: {
        properties: { field1: { minItems: 1 } },
        required: ['field1'],
      },
    },
    {
      if: {
        properties: { field3: { enum: ['opt3'] } },
        required: ['field3'],
      },
      then: {
        properties: { field1: { minItems: 1 } },
        required: ['field1'],
      },
    },
    {
      if: {
        properties: { field2: { enum: ['opt1', 'opt2'] } },
        required: ['field2'],
      },
      then: {
        properties: { field5: { minItems: 1 } },
        required: ['field5'],
      },
    },
  ],
};

export const complexUISchema: CustomUISchema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Group',
      id: 'section1',
      label: 'Section 1',
      elements: [
        {
          type: 'Control',
          id: 'field1',
          label: 'Field 1',
          parentId: 'section1',
          scope: '#/properties/field1',
          rule: {
            effect: RuleEffect.SHOW,
            condition: {
              scope: '#',
              schema: {
                properties: {
                  field2: { enum: ['opt1', 'opt2'] },
                  field3: { enum: ['opt3'] },
                },
              },
            },
          },
        },
        {
          type: 'Control',
          id: 'field2',
          label: 'Field 2',
          parentId: 'section1',
          scope: '#/properties/field2',
          options: {
            fieldType: FieldOptionType.Dropdown,
          },
        },
        {
          type: 'Control',
          id: 'field3',
          label: 'Field 3',
          parentId: 'section1',
          scope: '#/properties/field3',
          options: {
            fieldType: FieldOptionType.Radio,
          },
        },
        {
          type: 'Control',
          id: 'field4',
          label: 'Field 4',
          parentId: 'section1',
          scope: '#/properties/field4',
          options: {
            fieldType: FieldOptionType.Multiselect,
          },
        },
      ],
    },
  ],
};

export const SchemaId = {
  parentFieldId: 'parent',
  childFieldId: 'child',
  grandChildFieldId: 'grandchild',
  parentOptionYes: 'yes',
  parentOptionNo: 'no',
  childOptionYes: 'child-yes',
};

export const complexSchemaExample1: CustomSchema = {
  type: 'object',
  properties: {
    [SchemaId.parentFieldId]: {
      type: 'string',
      parentId: 'section',
      isCustomisable: true,
      oneOf: [
        { const: SchemaId.parentOptionYes, title: 'Yes' },
        { const: SchemaId.parentOptionNo, title: 'No' },
      ],
    },
    [SchemaId.childFieldId]: {
      type: 'string',
      parentId: 'section',
      isCustomisable: true,
      oneOf: [{ const: SchemaId.childOptionYes, title: 'Yes' }],
      conditionalOptions: {
        tokens: [
          {
            propertyKey: SchemaId.parentFieldId,
            value: [SchemaId.parentOptionYes],
            operator: '=',
          },
        ],
        operation: 'and',
      },
    },
    [SchemaId.grandChildFieldId]: {
      type: 'string',
      parentId: 'section',
      isCustomisable: true,
      conditionalOptions: {
        tokens: [
          {
            propertyKey: SchemaId.childFieldId,
            value: [SchemaId.childOptionYes],
            operator: '=',
          },
        ],
        operation: 'and',
      },
    },
  },
  allOf: [
    {
      if: {
        properties: {
          [SchemaId.parentFieldId]: { enum: [SchemaId.parentOptionYes] },
        },
        required: [SchemaId.parentFieldId],
      },
      then: {
        properties: {
          [SchemaId.childFieldId]: { minItems: 1 },
        },
        required: [SchemaId.childFieldId],
      },
    },
    {
      if: {
        properties: {
          [SchemaId.childFieldId]: { enum: [SchemaId.childOptionYes] },
        },
        required: [SchemaId.childFieldId],
      },
      then: {
        properties: {
          [SchemaId.grandChildFieldId]: { minItems: 1 },
        },
        required: [SchemaId.grandChildFieldId],
      },
    },
  ],
};

export const complexUISchemaExample1: CustomUISchema = {
  type: 'VerticalLayout',
  elements: [
    {
      id: 'section',
      type: 'Group',
      elements: [
        {
          id: SchemaId.parentFieldId,
          type: 'Control',
          label: 'Parent',
          options: { fieldType: 'dropdown' },
        },
        {
          id: SchemaId.childFieldId,
          type: 'Control',
          label: 'Child',
          options: { fieldType: 'dropdown' },
          rule: {
            effect: RuleEffect.SHOW,
            condition: {
              scope: '#',
              schema: {
                required: [SchemaId.parentFieldId],
                properties: {
                  [SchemaId.parentFieldId]: {
                    enum: [SchemaId.parentOptionYes],
                  },
                },
              },
              failWhenUndefined: true,
            },
          },
        },
        {
          id: SchemaId.grandChildFieldId,
          type: 'Control',
          label: 'Grandchild',
          options: { fieldType: 'dropdown' },
          rule: {
            effect: RuleEffect.SHOW,
            condition: {
              scope: '#',
              schema: {
                required: [SchemaId.childFieldId],
                properties: {
                  [SchemaId.childFieldId]: { enum: [SchemaId.childOptionYes] },
                },
              },
              failWhenUndefined: true,
            },
          },
        },
      ],
    },
  ],
};
