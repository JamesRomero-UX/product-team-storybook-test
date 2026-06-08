import type { Page } from '@playwright/test';

import { ThirdPartyForm } from '../forms/ThirdPartyForm';
import { Tab } from './Tab';

export class ThirdPartyDetailsTab extends Tab {
  thirdPartyForm: ThirdPartyForm;

  constructor(page: Page, id: string) {
    super(page, id);
    this.thirdPartyForm = new ThirdPartyForm(page);
  }
}
