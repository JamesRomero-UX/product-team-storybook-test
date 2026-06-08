import type { Locator } from '@playwright/test';
import { expect, type Page } from '@playwright/test';
import type { ElementWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import { ChangeRequestAlert } from '../alerts/ChangeRequestAlert';
import { ApprovalPanel } from '../components/ApprovalPanel';
import { ActionRequiresApprovalModal } from '../modals/ActionRequiresApprovalModal';
import type { CustomFieldTypes } from './AddCustomFieldForm';
import { DropdownButton } from './DropdownButton';
import type { CustomisableField } from './fields/CustomisableField';
import { DateInput } from './fields/DateInput';
import { Input } from './fields/Input';
import { MultiSelect } from './fields/MultiSelect';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type FormsFields = {
  [key: string]: FormFieldValue;
};

export type PropertyFilterCondition = {
  value: string;
  label: string;
  operator: '=' | '!=' | '<' | '<=' | '>' | '>=' | ':';
  type?: 'text' | 'dropdown';
};

export type StringOption = { _tag: 'StringOption'; value: string };
export type AltValueOption = {
  _tag: 'AltValueOption';
  altValue: string;
  value: string;
};

export type FormFieldValue =
  | number
  | boolean
  | string
  | string[]
  | number[]
  | StringOption[]
  | AltValueOption[]
  | PropertyFilterCondition
  | undefined;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export abstract class BaseForm<T extends FormsFields = {}> {
  readonly cloudScapeWrapper: ElementWrapper;
  readonly page: Page | Locator;
  readonly saveButton: Locator;
  readonly saveFormConfigurationButton: Locator;
  readonly cancelButton: Locator;

  fields: { [fieldId in keyof T]: CustomisableField };

  readonly formSettingsButton: DropdownButton;
  readonly actionRequiresApprovalModal: ActionRequiresApprovalModal;
  readonly changeRequestAlert: ChangeRequestAlert;
  readonly approvalPanel: ApprovalPanel;

  constructor(parent: Page | Locator, parentSelector?: string) {
    this.page = parent;
    this.actionRequiresApprovalModal = new ActionRequiresApprovalModal(parent);
    this.cloudScapeWrapper = createWrapper(parentSelector ?? '');
    this.saveButton = this.page.getByRole('button', {
      name: 'Save',
      exact: true,
    });
    this.cancelButton = this.page.getByRole('button', {
      name: 'cancel',
    });
    this.saveFormConfigurationButton = this.page.getByRole('button', {
      name: 'Save form configuration',
      exact: true,
    });
    this.formSettingsButton = new DropdownButton(
      parent,
      'form-settings-button'
    );
    this.changeRequestAlert = new ChangeRequestAlert(parent);
    // Should this be within a form as it sounds outside the form with help...?
    const page = 'page' in parent ? parent.page() : parent;
    this.approvalPanel = new ApprovalPanel(page);
  }

  /**
   * Returns all validation errors for the form.
   * @returns
   */
  async getErrors(): Promise<{ [fieldId in keyof T]?: string | undefined }> {
    const errors: { [fieldId in keyof T]?: string | undefined } = {};
    for (const fieldId in this.fields) {
      const error = await this.fields[fieldId].getError();
      if (error) {
        errors[fieldId] = error;
      }
    }

    return errors;
  }

  /**
   * Returns all form labels
   * @returns
   */
  async getLabels(): Promise<{ [fieldId in keyof T]?: string | undefined }> {
    const labels: { [fieldId in keyof T]?: string | undefined } = {};
    for (const fieldId in this.fields) {
      if (await this.fields[fieldId].isVisible()) {
        const label = await this.fields[fieldId].getLabel();
        if (label) {
          labels[fieldId] = label;
        }
      }
    }

    return labels;
  }

  /**
   * Returns all form labels
   * @returns
   */
  async getDisabledFieldState(): Promise<{
    [fieldId in keyof T]?: boolean | undefined;
  }> {
    const disableds: { [fieldId in keyof T]?: boolean | undefined } = {};
    for (const fieldId in this.fields) {
      if (await this.fields[fieldId].isVisible()) {
        disableds[fieldId] = await this.fields[fieldId].isDisabled();
      } else {
        console.log('Field', fieldId, 'is not visible');
      }
    }

    return disableds;
  }

  async expectDisabledFieldState(
    expectedValues: Partial<{ [fieldId in keyof T]: boolean }>
  ) {
    await expect
      .poll(async () => this.getDisabledFieldState(), { timeout: 20000 })
      .toEqual(expectedValues);
  }

  async expectLabels(
    expectedLabels: Partial<{ [fieldId in keyof T]: FormFieldValue }>
  ) {
    await expect
      .poll(async () => this.getLabels(), { timeout: 20000 })
      .toEqual(expectedLabels);
  }

  /**
   * Returns all form values
   * @returns
   */
  async getValues(): Promise<{
    [fieldId in keyof T]?: FormFieldValue | undefined;
  }> {
    const values: { [fieldId in keyof T]?: FormFieldValue | undefined } = {};
    for (const fieldId in this.fields) {
      console.log('Checking field', fieldId);
      const field = this.fields[fieldId];
      if (await field.isVisible()) {
        const value = await this.fields[fieldId].getValue();
        if (value !== undefined) {
          values[fieldId] = value;
          console.log('Field', fieldId, 'has value', value);
        } else {
          console.log('Field', fieldId, 'has no value');
        }
      } else {
        console.log('Field', fieldId, 'is not visible');
      }
    }
    console.log('Returning values', values);

    return values;
  }

  async expectValues(
    expectedValues: Partial<{ [fieldId in keyof T]: FormFieldValue }>
  ) {
    await expect
      .poll(async () => this.getValues(), { timeout: 20000 })
      .toEqual(expectedValues);
  }

  /**
   * Fills in form fields
   * @returns
   */
  async fillForm(
    values: Partial<T>,
    customAttributes: CustomAttributeValue[] = []
  ) {
    for (const fieldId in values) {
      const value = values[fieldId];
      if (value !== undefined) {
        console.log('Setting field', fieldId, 'to value', value);
        await this.fields[fieldId].setValue(value);
      }
    }

    for (const attribute of customAttributes) {
      await this.setCustomField(attribute);
    }
  }

  async fillFormAndClickSave(
    values: Partial<T>,
    customAttributes: CustomAttributeValue[] = []
  ) {
    await this.fillForm(values, customAttributes);
    await this.saveButton.click();
  }

  getCustomField<T extends CustomFieldTypes>(
    type: T,
    label: string
  ): CustomisableField {
    switch (type) {
      case 'Text':
        return new Input(this.page, label);
      case 'Link':
        return new Input(this.page, label);
      case 'Text area':
        return new TextArea(this.page, label);
      case 'Dropdown':
        return new Select(this.page, label);
      case 'Multiselect':
      case 'User':
      case 'Department':
        return new MultiSelect(this.page, label);
      case 'Date':
        return new DateInput(this.page, label);
      default:
        throw new Error(`Unsupported custom field type ${type}`);
    }
  }

  /**
   * Sets a custom field value
   * @param type - The type of the custom field
   * @param label - The label of the custom field
   * @param value - The value to set
   */
  setCustomField({ type, label, value }: CustomAttributeValue): Promise<void> {
    const field = this.getCustomField(type, label);

    return field.setValue(value);
  }
}

export type CustomAttributeIdentifier = {
  type: CustomFieldTypes;
  label: string;
};

export type CustomAttributeValue = CustomAttributeIdentifier & {
  value: FormFieldValue;
};
