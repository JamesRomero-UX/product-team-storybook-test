import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { DateInput } from './fields/DateInput';
import { FileInput } from './fields/FileInput';
import { MultiSelect } from './fields/MultiSelect';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type DocumentRatingFormValues = {
  rating: string;
  resultDate: string;
  rationale: string;
  documents: string[];
  attachFiles: string[];
  assessment: string;
};

export class DocumentRatingForm extends BaseForm<DocumentRatingFormValues> {
  constructor(page: Page) {
    super(page);

    this.fields = {
      rating: new Select(page, 'rating'),
      resultDate: new DateInput(page, 'testDate'),
      rationale: new TextArea(page, 'rationale'),
      documents: new MultiSelect(page, 'documents'),
      attachFiles: new FileInput(page, 'attachFiles'),
      assessment: new Select(page, 'assessment'),
    };
  }
}
