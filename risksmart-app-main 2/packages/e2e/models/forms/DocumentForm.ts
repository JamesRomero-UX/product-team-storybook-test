import { type Page } from '@playwright/test';

import type { TestScheduleValues } from '../components/TestScheduleForm';
import { getTestScheduleFormFields } from '../components/TestScheduleForm';
import { BaseForm } from './BaseForm';
import { Input } from './fields/Input';
import { MultiSelect } from './fields/MultiSelect';
import { RadioGroup } from './fields/RadioGroup';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type DocumentFormValues = {
  title: string;
  purpose: string;
  parent: string;
  type: 'Policy' | 'Standard' | 'Framework' | 'Statement of process';
  owners: string[];
  contributors: string[];
  attestationGroups?: string[];
  tags: string[];
  departments: string[];
  linkedDocuments: string[];
} & TestScheduleValues;

export class DocumentForm extends BaseForm<DocumentFormValues> {
  constructor(page: Page) {
    super(page);
    this.fields = {
      ...getTestScheduleFormFields(page),
      title: new Input(page, 'title'),
      purpose: new TextArea(page, 'purpose'),
      parent: new Select(page, 'parentDocument'),
      type: new RadioGroup(page, 'type'),
      owners: new MultiSelect(page, 'owners'),
      contributors: new MultiSelect(page, 'contributors'),
      attestationGroups: new MultiSelect(page, 'attestationGroups'),
      tags: new MultiSelect(page, 'tags'),
      departments: new MultiSelect(page, 'departments'),
      linkedDocuments: new MultiSelect(page, 'linkedDocuments'),
    };
  }
}
