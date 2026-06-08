import { type Page } from '@playwright/test';
import type { ElementWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import { HeaderComponent } from './HeaderComponent';
import { HelpPanel } from './HelpPanel';
import { NavigationComponent } from './NavigationComponent';
import { NotificationBanner } from './NotificationBanner';

export abstract class BasePage {
  readonly header: HeaderComponent;
  readonly navigation: NavigationComponent;
  readonly cloudScapeWrapper: ElementWrapper;
  readonly page: Page;
  readonly helpPanel: HelpPanel;
  readonly notificationBanner: NotificationBanner;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.navigation = new NavigationComponent(page);
    this.cloudScapeWrapper = createWrapper();
    this.helpPanel = new HelpPanel(page);
    this.notificationBanner = new NotificationBanner(page);
  }
}
