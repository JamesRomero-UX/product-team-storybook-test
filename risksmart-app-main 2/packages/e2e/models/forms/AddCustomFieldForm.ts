import type { Locator } from '@playwright/test';

import { TinyMCEKeyRequiredAlert } from '../alerts/TinyMCEKeyRequiredAlert';
import type {
  AltValueOption,
  PropertyFilterCondition,
  StringOption,
} from './BaseForm';
import { BaseForm } from './BaseForm';
import { CustomFieldOptions } from './fields/CustomFieldOptions';
import { Editor } from './fields/Editor';
import { Input } from './fields/Input';
import { PropertyFilter } from './fields/PropertyFilter';
import { Select } from './fields/Select';
import { Toggle } from './fields/Toggle';

export type CustomFieldTypes =
  | 'Text'
  | 'Dropdown'
  | 'Link'
  | 'Date'
  | 'Multiselect'
  | 'Text area'
  | 'User'
  | 'Department';

export type AddCustomFieldFormValues = {
  fieldType: CustomFieldTypes;
  label: string;
  altLabel?: string;
  showAltValues?: boolean;
  description: string;
  options?: string[] | StringOption[] | AltValueOption[];
  conditions: PropertyFilterCondition | string;
  required: boolean;
  hidden: boolean;
  readonly: boolean;
  setDefaultValue: boolean;
  enableCustomLabel: boolean;
};

export class AddCustomFieldForm extends BaseForm<AddCustomFieldFormValues> {
  readonly addOptionButton: Locator;
  tinyMCEApiKeyRequiredAlert: TinyMCEKeyRequiredAlert;
  constructor(parent: Locator) {
    super(parent);
    this.tinyMCEApiKeyRequiredAlert = new TinyMCEKeyRequiredAlert(parent);
    this.fields = {
      fieldType: new Select(
        parent.page(),
        'fieldType',
        '[data-testid="editFieldModal"]'
      ),
      enableCustomLabel: new Toggle(
        parent.page(),
        '[data-testid=enableCustomLabel]'
      ),
      label: new Input(
        parent.page(),
        'label',
        '[data-testid="editFieldModal"]'
      ),
      altLabel: new Input(
        parent.page(),
        'altLabel',
        '[data-testid="editFieldModal"]'
      ),
      showAltValues: new Toggle(parent.page(), '[data-testid="showAltValues"]'),
      description: new Editor(parent.page(), 'description'),
      options: new CustomFieldOptions(
        parent.page(),
        'options',
        '[data-testid="editFieldModal"]'
      ),
      required: new Toggle(parent.page(), '[data-testid=Required]'),
      hidden: new Toggle(parent.page(), '[data-testid=Hidden]'),
      readonly: new Toggle(parent.page(), '[data-testid=ReadOnly]'),
      setDefaultValue: new Toggle(
        parent.page(),
        '[data-testid=EnableDefaultValue]'
      ),
      conditions: new PropertyFilter(parent.page(), 'conditions'),
    };
  }

  async fillForm(values: Partial<AddCustomFieldFormValues>) {
    await this.tinyMCEApiKeyRequiredAlert.closeIfVisible();

    return super.fillForm(values);
  }
}
