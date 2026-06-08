import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { AutosuggestInput } from './fields/AutosuggestInput';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type CauseFields = {
  title: string;
  significance: string;
  description: string;
};

export class CauseForm extends BaseForm<CauseFields> {
  constructor(page: Page) {
    super(page);

    this.fields = {
      title: new AutosuggestInput(page, 'title'),
      significance: new Select(page, 'significance'),
      description: new TextArea(page, 'description'),
    };
  }
}
