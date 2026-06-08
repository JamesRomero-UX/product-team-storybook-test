import { type Page } from '@playwright/test';

import type { TestScheduleValues } from '../components/TestScheduleForm';
import { getTestScheduleFormFields } from '../components/TestScheduleForm';
import { BaseForm } from './BaseForm';
import { AutosuggestInput } from './fields/AutosuggestInput';
import { MultiSelect } from './fields/MultiSelect';
import { RadioGroup } from './fields/RadioGroup';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type Type = '-' | 'High-level standard' | 'Chapter' | 'Rule';
export type Adherence =
  | '-'
  | 'Mandatory'
  | 'Advised'
  | 'Flexible'
  | 'Best practice';

export type ObligationFormValues = {
  title: string;
  parent: string;
  description: string;
  interpretation: string;
  owners: string[];
  contributors: string[];
  tags: string[];
  departments: string[];
  adherence: Adherence;
  type: Type;
} & TestScheduleValues;

export class ObligationForm extends BaseForm<ObligationFormValues> {
  constructor(page: Page) {
    super(page);

    this.fields = {
      ...getTestScheduleFormFields(page),
      title: new AutosuggestInput(page, 'title'),
      parent: new Select(page, 'parentId'),
      description: new TextArea(page, 'description'),
      interpretation: new TextArea(page, 'interpretation'),
      owners: new MultiSelect(page, 'owners'),
      contributors: new MultiSelect(page, 'contributors'),
      tags: new MultiSelect(page, 'tags'),
      departments: new MultiSelect(page, 'departments'),
      type: new RadioGroup<Type>(page, 'type'),
      adherence: new Select<Adherence>(page, 'adherence'),
    };
  }
}
