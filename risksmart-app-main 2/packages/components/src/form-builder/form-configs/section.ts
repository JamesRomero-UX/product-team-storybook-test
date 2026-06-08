import type {
  JsonSchema,
  Labelable,
  UISchemaElement,
  VerticalLayout,
} from '@jsonforms/core';

import type { SectionConfigData } from '../types';
import { LayoutType } from '../types';

export const defaultSectionData: SectionConfigData = {
  sectionTitle: '',
};

export const sectionSchema: JsonSchema = {
  type: 'object',
  properties: {
    sectionTitle: { type: 'string', minLength: 1 },
    // TODO: Re-implement in v2
    // isConditional: { type: 'boolean' },
  },
  required: ['sectionTitle'],
  errorMessage: {
    properties: {
      sectionTitle: 'This field is required',
    },
  },
};

interface VerticalLayoutWithLabelables extends VerticalLayout {
  elements: UISchemaElement[] & Labelable[];
}

export const sectionUISchema: VerticalLayoutWithLabelables = {
  type: LayoutType.VerticalLayout,
  elements: [
    {
      type: 'Control',
      label: 'Section Title',
      scope: '#/properties/sectionTitle',
      options: {
        placeholder: 'Enter section title here...',
      },
    },
    // TODO: Re-implement in v2
    // {
    //   type: 'Control',
    //   label: 'Add conditional logic',
    //   scope: '#/properties/isConditional',
    // },
  ],
};
