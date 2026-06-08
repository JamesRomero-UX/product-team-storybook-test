import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { AutosuggestInput } from './fields/AutosuggestInput';
import { Input } from './fields/Input';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type ConsequenceFields = {
  title: string;
  type: string;
  criticality: string;
  costType: string;
  costValue: string;
  description: string;
};

export class ConsequenceForm extends BaseForm<ConsequenceFields> {
  constructor(page: Page) {
    super(page);

    this.fields = {
      title: new AutosuggestInput(page, 'title'),
      type: new Select(page, 'consequenceType'),
      criticality: new Select(page, 'criticality'),
      costType: new Select(page, 'costType'),
      costValue: new Input(page, 'costValue'),
      description: new TextArea(page, 'description'),
    };
  }
}
