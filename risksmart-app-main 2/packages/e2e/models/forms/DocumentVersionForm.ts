import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { Editor } from './fields/Editor';
import { FileInput } from './fields/FileInput';
import { Input } from './fields/Input';
import { RadioGroup } from './fields/RadioGroup';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type DocumentVersionFormValues = {
  versionNumber: string;
  summary: string;
  status: string;
  type: 'Link' | 'File' | 'Text';
  link: string;
  attachFiles: string[];
  text: string;
  reasonForReview: string;
  reviewedBy: string;
  reviewDate: string;
  nextReviewDate: string;
};

export class DocumentVersionForm extends BaseForm<DocumentVersionFormValues> {
  submitForApprovalButton: Locator;

  constructor(page: Page) {
    super(page);

    this.fields = {
      versionNumber: new Input(page, 'version'),
      summary: new TextArea(page, 'summary'),
      status: new Select(page, 'status'),
      type: new RadioGroup<'Link' | 'File' | 'Text'>(page, 'type'),
      link: new Input(page, 'link'),
      attachFiles: new FileInput(page, 'attachFiles'),
      text: new Editor(page, 'content'),
      reviewedBy: new Select(page, 'reviewedBy'),
      reasonForReview: new Select(page, 'reasonForReview'),
      reviewDate: new Input(page, 'reviewDate'),
      nextReviewDate: new Input(page, 'nextReviewDate'),
    };
    this.submitForApprovalButton = this.page.getByRole('button', {
      name: 'Submit for Approval',
      exact: true,
    });
  }
}
