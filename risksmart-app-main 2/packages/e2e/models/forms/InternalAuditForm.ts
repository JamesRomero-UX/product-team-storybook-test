import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { AutosuggestInput } from './fields/AutosuggestInput';
import { Input } from './fields/Input';
import { MultiSelect } from './fields/MultiSelect';
import { TextArea } from './fields/TextArea';

export type InternalAuditFormFields = {
  title: string;
  description: string;
  businessArea: string;
  owners: string[];
  contributors: string[];
  departments: string[];
  tags: string[];
};

export class InternalAuditForm extends BaseForm<InternalAuditFormFields> {
  constructor(page: Page) {
    super(page);
    this.fields = {
      title: new Input(page, 'title'),
      description: new TextArea(page, 'description'),
      businessArea: new AutosuggestInput(page, 'businessArea'),
      owners: new MultiSelect(page, 'owners'),
      contributors: new MultiSelect(page, 'contributors'),
      departments: new MultiSelect(page, 'departments'),
      tags: new MultiSelect(page, 'tags'),
    };
  }
}
