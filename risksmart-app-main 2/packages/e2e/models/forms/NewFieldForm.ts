import type { Locator } from '@playwright/test';

import { TinyMCEKeyRequiredAlert } from '../alerts/TinyMCEKeyRequiredAlert';
import type { PropertyFilterCondition } from './BaseForm';
import { BaseForm } from './BaseForm';
import { Editor } from './fields/Editor';
import { Input } from './fields/Input';
import { PropertyFilter } from './fields/PropertyFilter';
import { Select } from './fields/Select';
import { Toggle } from './fields/Toggle';

export type NewFieldFormValues = {
  label: string;
  description: string;
  fieldType: string;
  required: boolean;
  hidden: boolean;
  readonly: boolean;
  setDefaultValue: boolean;
  conditions: PropertyFilterCondition | string;
  enableCustomLabel: boolean;
};

export class NewFieldForm extends BaseForm<NewFieldFormValues> {
  tinyMCEApiKeyRequiredAlert: TinyMCEKeyRequiredAlert;
  constructor(container: Locator) {
    super(container);
    this.tinyMCEApiKeyRequiredAlert = new TinyMCEKeyRequiredAlert(container);
    this.fields = {
      enableCustomLabel: new Toggle(
        container,
        '[data-testid=enableCustomLabel]'
      ),
      label: new Input(container, 'label'),
      description: new Editor(container, 'description'),
      fieldType: new Select(container, 'fieldType'),
      required: new Toggle(container, '[data-testid=Required]'),
      hidden: new Toggle(container, '[data-testid=Hidden]'),
      readonly: new Toggle(container, '[data-testid=ReadOnly]'),
      setDefaultValue: new Toggle(
        container,
        '[data-testid=EnableDefaultValue]'
      ),
      conditions: new PropertyFilter(container, 'conditions'),
    };
  }

  async fillForm(values: Partial<NewFieldFormValues>) {
    await this.tinyMCEApiKeyRequiredAlert.closeIfVisible();

    return super.fillForm(values);
  }
}
