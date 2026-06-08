import { type Page } from '@playwright/test';

import { TinyMCEKeyRequiredAlert } from '../alerts/TinyMCEKeyRequiredAlert';
import { BaseForm } from './BaseForm';
import { Input } from './fields/Input';
import { MultiSelect } from './fields/MultiSelect';
import { TextArea } from './fields/TextArea';

export type ImpactFormFields = {
  name: string;
  rationale: string;
  owners: string[];
  likelihoodAppetite: string;
};

export class ImpactForm extends BaseForm<ImpactFormFields> {
  tinyMCEApiKeyRequiredAlert: TinyMCEKeyRequiredAlert;
  constructor(page: Page) {
    super(page);
    this.tinyMCEApiKeyRequiredAlert = new TinyMCEKeyRequiredAlert(page);
    this.fields = {
      name: new Input(page, 'name'),
      rationale: new TextArea(page, 'rationale'),
      owners: new MultiSelect(page, 'owners'),
      likelihoodAppetite: new Input(page, 'likelihoodAppetite'),
    };
  }

  async fillForm(impact: Partial<ImpactFormFields>) {
    await this.tinyMCEApiKeyRequiredAlert.closeIfVisible();

    return super.fillForm(impact);
  }
}
