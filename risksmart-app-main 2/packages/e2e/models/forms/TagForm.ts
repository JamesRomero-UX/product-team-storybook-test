import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { Input } from './fields/Input';

export type TagFormFields = {
  name: string;
  description: string;
};

export class TagForm extends BaseForm<TagFormFields> {
  constructor(page: Page) {
    super(page);

    this.fields = {
      name: new Input(page, 'name'),
      description: new Input(page, 'description'),
    };
  }
}
