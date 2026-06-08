import type {
  ControlElement,
  JsonSchema7,
  VerticalLayout,
} from '@jsonforms/core';

export interface CustomAttributeLayout extends VerticalLayout {
  elements: ControlElement[];
}

export interface CustomAttributeSchema {
  Schema: JsonSchema7;
  UiSchema: CustomAttributeLayout;
  Id?: string;
}
