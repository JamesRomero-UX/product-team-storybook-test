import { type Locator, type Page } from '@playwright/test';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

export class HelpPanel {
  readonly page: Page | Locator;
  readonly header: Locator;
  readonly component: Locator;
  readonly helpSectionHeading: Locator;
  readonly helpSectionContent: Locator;

  constructor(page: Page | Locator) {
    this.page = page;
    const cloudScapeWrapper = createWrapper();

    const helpPanel = cloudScapeWrapper.findHelpPanel();
    this.component = page.locator(helpPanel.toSelector());
    this.header = page.locator(helpPanel.findHeader().toSelector());

    this.helpSectionHeading = this.component.getByTestId(
      'help-section-heading'
    );
    this.helpSectionContent = this.component.getByTestId(
      'help-section-content'
    );
  }
}
