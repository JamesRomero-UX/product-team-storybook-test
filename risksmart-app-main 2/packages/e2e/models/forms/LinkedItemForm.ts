import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { MultiSelect } from './fields/MultiSelect';
import { Select } from './fields/Select';

export type LinkedItemFormFields = {
  type: string;
  targetTitle: string;
};

export class LinkedItemForm extends BaseForm<LinkedItemFormFields> {
  constructor(page: Page) {
    super(page);
    this.fields = {
      type: new Select(page, 'type'),
      targetTitle: new MultiSelect(page, 'target'),
    };
  }
}
