import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { FileInput } from './fields/FileInput';
import { Input } from './fields/Input';
import { TextArea } from './fields/TextArea';

export type ActionUpdateFormFields = {
  title: string;
  description: string;
  attachFiles: string[];
};

export class ActionUpdateForm extends BaseForm<ActionUpdateFormFields> {
  readonly title: Locator;
  readonly description: Locator;

  constructor(page: Page) {
    super(page);
    this.fields = {
      title: new Input(page, 'title'),
      description: new TextArea(page, 'description'),
      attachFiles: new FileInput(page, 'attachFiles'),
    };
  }
}
