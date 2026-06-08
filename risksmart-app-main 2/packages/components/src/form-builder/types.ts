import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';
import type {
  BaseUISchemaElement,
  ControlProps,
  JsonSchema7,
  Labelable,
  RuleEffect,
  Scopable,
  VerticalLayout,
} from '@jsonforms/core';
import type { SchemaBasedCondition } from '@jsonforms/core/src/models/uischema';

export enum CustomFormSubmitType {
  Draft = 'draft',
  None = 'none',
  Submit = 'submit',
}

export enum JsonFormsValidationMode {
  ValidateAndHide = 'ValidateAndHide',
  ValidateAndShow = 'ValidateAndShow',
  ValidateAndSubmit = 'ValidateAndSubmit',
}

export interface ResponseData {
  [key: string]: { [key: string]: File[] } | boolean | number | string;
}

export enum LayoutType {
  Group = 'Group',
  VerticalLayout = 'VerticalLayout',
}

export enum FormBuilderAction {
  Add = 'add',
  Edit = 'edit',
}

export interface FieldOption {
  value: string;
  generatedId: string;
}

export interface FieldSelectOption {
  const: string;
  title: string;
}

export enum FieldOptionType {
  Date = 'date',
  Dropdown = 'dropdown',
  Multiselect = 'multiselect',
  Number = 'number',
  Radio = 'radio',
  Text = 'text',
  TextArea = 'textArea',
  Url = 'url',
}

export enum FieldUtilityType {
  AddConditional = 'addConditional',
  AddOption = 'addOption',
}

export interface SectionConfigData {
  sectionTitle: string;
}

export interface FieldConfigData {
  fieldTitle: string;
  placeholder?: string;
  description?: string;
  fieldType: FieldOptionType;
  selectOptions?: FieldOption[];
  isPropertyRequired: boolean;
  allowAttachments: boolean;
  files?: File[];
  isConditional: boolean;
  conditionalOptions?: PropertyFilterQuery;
}

export const emptyPropertyFilterQuery: PropertyFilterQuery = {
  operation: 'and',
  tokens: [],
};

export interface SchemaCondition {
  if: {
    properties: {
      [key: string]: { enum?: string[]; const?: boolean };
    };
    required: string[];
  };
  then: {
    properties: {
      [key: string]: {
        minItems?: number;
        properties?: CustomSchemaProperties | SchemaProperties;
      };
    };
    required: string[];
  };
}

export interface CustomSchema extends JsonSchema7 {
  type: 'array' | 'boolean' | 'number' | 'object' | 'string';
  properties?: CustomSchemaProperties | SchemaProperties;
  minLength?: number;
  minItems?: number;
  isPropertyRequired?: boolean;
  allowAttachments?: boolean;
  required?: string[];
  conditionalOptions?: PropertyFilterQuery;
  allOf?: SchemaCondition[];
}

export interface CustomSchemaProperty extends SchemaProperty {
  parentId: string;
  isCustomisable: boolean;
}

export interface SchemaProperty extends CustomSchema {
  minLength?: number;
  minItems?: number;
  uniqueItems?: boolean;
  allowAttachments?: boolean;
  isConditional?: boolean;
  oneOf?: FieldSelectOption[];
  items?: {
    oneOf?: FieldSelectOption[];
    type?: 'object' | 'string';
    properties?: CustomSchemaProperties | SchemaProperties;
    items?: CustomSchemaProperties;
  };
}

export interface SchemaProperties {
  [property: string]: SchemaProperty;
}

export interface CustomSchemaProperties {
  [property: string]: CustomSchemaProperty;
}

export interface CustomDropDownSchema extends CustomSchema {
  parentId: string;
  isCustomisable: boolean;
  isConditional: boolean;
  type: 'string';
  oneOf?: FieldSelectOption[];
}

export interface CustomMultiselectSchema extends CustomSchema {
  parentId: string;
  isCustomisable: boolean;
  isConditional: boolean;
  type: 'array';
  uniqueItems: boolean;
  items?: {
    oneOf?: FieldSelectOption[];
  };
}

export type CustomUISchemaElement = BaseUISchemaElement &
  Labelable &
  Scopable & {
    id: string;
    parentId?: string;
    rule?: { effect: RuleEffect; condition: SchemaBasedCondition };
    elements?: CustomUISchemaElement[];
  };

export type ExtendedControlProps = ControlProps & {
  schema: CustomSchemaProperty;
  uischema: CustomUISchemaElement;
};

export type CustomUISchema = VerticalLayout & {
  id?: string;
  elements: CustomUISchemaElement[];
};
