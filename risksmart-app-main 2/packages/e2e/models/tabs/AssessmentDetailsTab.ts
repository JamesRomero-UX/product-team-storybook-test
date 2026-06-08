import type { Page } from '@playwright/test';

import { Tab } from './Tab';

export class AssessmentDetailsTab extends Tab {
  constructor(page: Page) {
    super(page, 'details');
  }
}
