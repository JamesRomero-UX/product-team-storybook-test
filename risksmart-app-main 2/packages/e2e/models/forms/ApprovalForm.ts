import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { Checkbox } from './fields/Checkbox';
import { MultiSelect } from './fields/MultiSelect';
import { Select } from './fields/Select';

export type ApprovalFields = {
  workflow: string;
  requireOwnerApprovalAtThisLevel: boolean;
  approvers: string[];
};

export class ApprovalForm extends BaseForm<ApprovalFields> {
  constructor(page: Page) {
    super(page);
    this.fields = {
      approvers: new MultiSelect(page, 'approvers', false),
      workflow: new Select(page, 'workflow'),
      requireOwnerApprovalAtThisLevel: new Checkbox(
        page,
        'requireOwnerApprovalAtThisLevel'
      ),
    };
  }
}
