import type { FieldTypeDefinition } from '../reporting/display-types';

export interface FormFieldConfig {
  fieldId: string;

  /**
   * This is the default header for the column in a table. Eventually we will align column headers with form labels.
   * But for now, we'll keep them separate to be consistent with the existing codebase.
   */
  columnHeader?: string;

  /**
   * This is the default label shown on the form field.
   */
  formLabel: string;

  /**
   * When set to true, allows this field to be used as a condition in rules. Defaults to false.
   */
  allowAsConditionSource?: boolean;

  /**
   * When set to true, conditions can be added to this field. Defaults to false.
   */
  allowTargetConditions?: boolean;

  /**
   * Optionally specify the display type for this field. If not specified, it will default to 'text'.
   */
  displayType?: FieldTypeDefinition;

  /**
   * ID of the parent field that controls the visibility of this field (if any). Used where sections
   * are controlled by a single field (see issue assessments for an example).
   */
  visibilityControlledByFieldId?: string;
}

export interface FormConfig {
  [key: string]: FormFieldConfig;
}
