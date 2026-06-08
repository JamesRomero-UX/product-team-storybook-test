import { type Page } from '@playwright/test';

import type { TestScheduleValues } from '../components/TestScheduleForm';
import { getTestScheduleFormFields } from '../components/TestScheduleForm';
import { BaseForm } from './BaseForm';
import { AutosuggestInput } from './fields/AutosuggestInput';
import { MultiSelect } from './fields/MultiSelect';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type ControlFormValues = {
  title: string;
  description: string;
  owners: string[];
  type: string;
  tags: string[];
  departments: string[];
  contributors: string[];
} & TestScheduleValues;

export class ControlForm extends BaseForm<ControlFormValues> {
  constructor(parent: Page) {
    const form = parent.getByTestId('controlForm');
    super(form);
    this.fields = {
      type: new Select(form, 'type'),
      title: new AutosuggestInput(form, 'title'),
      description: new TextArea(form, 'description'),
      owners: new MultiSelect(form, 'owners'),
      contributors: new MultiSelect(form, 'contributors'),
      tags: new MultiSelect(form, 'tags'),
      departments: new MultiSelect(form, 'departments'),
      ...getTestScheduleFormFields(form),
    };
  }
}
