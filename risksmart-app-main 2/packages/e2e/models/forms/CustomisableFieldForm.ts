import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';
import type { ElementWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import { BaseForm } from './BaseForm';
import { Input } from './fields/Input';
import { Toggle } from './fields/Toggle';

export type CustomisableFieldFormValues = {
  required: boolean;
  hidden: boolean;
  readOnly: boolean;
  setDefaultValue: boolean;
  defaultValue: string;
};
export class CustomisableFieldForm extends BaseForm<CustomisableFieldFormValues> {
  readonly cloudScapeWrapper: ElementWrapper;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cloudScapeWrapper = createWrapper();
    this.deleteButton = page.getByRole('button', {
      name: 'Delete',
      exact: true,
    });

    this.fields = {
      required: new Toggle(page, "[data-testid='Required']"),
      hidden: new Toggle(page, "[data-testid='Hidden']"),
      readOnly: new Toggle(page, "[data-testid='ReadOnly']"),
      setDefaultValue: new Toggle(page, "[data-testid='EnableDefaultValue']"),
      defaultValue: new Input(page, 'defaultValue'),
    };
  }
}
