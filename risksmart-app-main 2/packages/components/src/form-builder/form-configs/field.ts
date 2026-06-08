import type {
  BaseUISchemaElement,
  Labelable,
  SchemaBasedCondition,
  Scopable,
  VerticalLayout,
} from '@jsonforms/core';
import { RuleEffect } from '@jsonforms/core';

import type { CustomSchema, FieldConfigData, SchemaProperty } from '../types';
import { emptyPropertyFilterQuery } from '../types';
import { FieldUtilityType } from '../types';
import { LayoutType } from '../types';
import { FieldOptionType } from '../types';
import { useFieldTypeOptions } from '../useFieldTypeOptions';

export const defaultFieldConfigData: FieldConfigData = {
  fieldTitle: '',
  fieldType: FieldOptionType.Text,
  isPropertyRequired: true,
  allowAttachments: false,
  isConditional: false,
  conditionalOptions: emptyPropertyFilterQuery,
  selectOptions: [],
};

const selectOptionSchema: SchemaProperty = {
  type: 'array',
  minLength: 1,
  items: {
    type: 'object',
    properties: {
      value: {
        type: 'string',
        minLength: 1,
      },
      generatedId: {
        type: 'string',
        minLength: 1,
      },
    },
  },
};

const conditionalOptionsSchema: SchemaProperty = {
  type: 'object',
  properties: {
    operation: {
      type: 'string',
      enum: ['and', 'or'],
    },
    tokens: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          operator: { type: 'string', enum: ['='] },
          propertyKey: { type: 'string' },
          value: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
  },
};

export const useFieldSchema = (): CustomSchema => {
  const fieldTypeOptions = useFieldTypeOptions();

  return {
    type: 'object',
    properties: {
      fieldTitle: { type: 'string', minLength: 1 },
      placeholder: { type: 'string' },
      description: { type: 'string' },
      fieldType: {
        type: 'string',
        minLength: 1,
        oneOf: Object.entries(fieldTypeOptions).map(([_, option]) => {
          return { const: option.value, title: option.label };
        }),
      },
      selectOptions: selectOptionSchema,
      isPropertyRequired: { type: 'boolean' },
      allowAttachments: { type: 'boolean' },
      isConditional: { type: 'boolean' },
      conditionalOptions: conditionalOptionsSchema,
    },
    allOf: [
      {
        if: {
          properties: {
            fieldType: {
              enum: [
                FieldOptionType.Radio,
                FieldOptionType.Dropdown,
                FieldOptionType.Multiselect,
              ],
            },
          },
          required: ['fieldType'],
        },
        then: {
          properties: {
            selectOptions: {
              minItems: 1,
            },
          },
          required: ['selectOptions'],
        },
      },
      {
        if: {
          properties: {
            isConditional: { const: true },
          },
          required: ['isConditional'],
        },
        then: {
          properties: {
            conditionalOptions: {
              properties: {
                tokens: {
                  type: 'array',
                  minItems: 1,
                },
              },
            },
          },
          required: ['conditionalOptions'],
        },
      },
    ],
    required: [
      'fieldTitle',
      'fieldType',
      'isPropertyRequired',
      'allowAttachments',
      'isConditional',
    ],
    errorMessage: {
      properties: {
        fieldTitle: 'This field is required',
        fieldType: 'This field is required',
        selectOptions: 'This field is required',
        conditionalOptions: 'This field is required',
      },
    },
  };
};

interface UISchemeElementWithSchemaBasedRules extends BaseUISchemaElement {
  rule?: {
    effect: RuleEffect;
    condition: SchemaBasedCondition;
  };
}

interface VerticalLayoutWithLabelables extends VerticalLayout {
  elements: (UISchemeElementWithSchemaBasedRules & Labelable & Scopable)[];
}

const hideIfNotDropdownOrMultiselect = {
  effect: RuleEffect.HIDE,
  condition: {
    scope: '#/properties/fieldType',
    schema: {
      not: {
        enum: [
          FieldOptionType.Radio,
          FieldOptionType.Dropdown,
          FieldOptionType.Multiselect,
        ],
      },
    },
  },
};

export const fieldUISchema: VerticalLayoutWithLabelables = {
  type: LayoutType.VerticalLayout,
  elements: [
    {
      type: 'Control',
      label: 'Field title',
      scope: '#/properties/fieldTitle',
      options: {
        placeholder: 'Enter field title here...',
      },
    },
    {
      type: 'Control',
      label: 'Placeholder text',
      scope: '#/properties/placeholder',
      options: {
        placeholder: 'Enter placeholder text here...',
      },
      rule: {
        effect: RuleEffect.DISABLE,
        condition: {
          scope: '#/properties/fieldType',
          schema: { const: 'date' },
        },
      },
    },
    {
      type: 'Control',
      label: 'Guidance',
      scope: '#/properties/description',
      options: {
        placeholder: 'Enter guidance here...',
        description: 'This is an example of what the guidance will look like',
      },
    },
    {
      type: 'Control',
      label: 'Field type',
      scope: '#/properties/fieldType',
      options: {
        fieldType: FieldOptionType.Dropdown,
      },
    },
    {
      type: 'Control',
      label: 'Options',
      scope: '#/properties/selectOptions',
      rule: hideIfNotDropdownOrMultiselect,
      options: {
        placeholder: 'Enter option value',
        fieldType: FieldUtilityType.AddOption,
      },
    },
    {
      type: 'Control',
      label: 'Response required',
      scope: '#/properties/isPropertyRequired',
    },
    {
      type: 'Control',
      label: 'Allow attachments',
      scope: '#/properties/allowAttachments',
    },
    {
      type: 'Control',
      label: 'Add conditional logic',
      scope: '#/properties/isConditional',
    },
    {
      type: 'Control',
      label: 'Show when...',
      scope: '#/properties/conditionalOptions',
      rule: {
        effect: RuleEffect.HIDE,
        condition: {
          scope: '#/properties/isConditional',
          schema: { const: false },
        },
      },
      options: {
        fieldType: FieldUtilityType.AddConditional,
      },
    },
  ],
};
