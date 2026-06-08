import createWrapper from '@cloudscape-design/board-components/test-utils/selectors';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { Ribbon } from './components/Ribbon.ts';
import { DropdownButton } from './forms/DropdownButton';
import { MultiSelect } from './forms/fields/MultiSelect';

export class DashboardPage extends BasePage {
  readonly menu: DropdownButton;
  readonly addWidgetButton: Locator;
  readonly emptyDashboardMessage: Locator;
  readonly ribbon: Ribbon;
  readonly filterDropdown: MultiSelect;

  constructor(page: Page) {
    super(page);
    this.menu = new DropdownButton(page, 'dashboardMenu');
    this.addWidgetButton = page.getByText('Add widget');
    this.emptyDashboardMessage = page.getByText('Your dashboard is empty');
    this.ribbon = new Ribbon(page, 'my-items-ribbon');
    this.filterDropdown = new MultiSelect(page, 'my-items-filter', false);
  }

  private async navigateTo() {
    await this.navigation.click('Home');
  }

  async navigateToAndAssertTitle(dashboardType: 'Dashboard' | 'My Items') {
    await this.navigateTo();

    const toggle = this.page.getByRole('button', {
      name: dashboardType,
      exact: true,
    });
    await toggle.click();

    await expect(this.header.title).toHaveText(dashboardType);
  }

  async dragWidgetOnToBoard(widgetTitle: string) {
    const paletteItemDragHandle = this.page.locator(
      createWrapper()
        .findPaletteItem(`:has-text("${widgetTitle}")`)
        .findDragHandle()
        .toSelector()
    );
    const board = this.page.locator(
      createWrapper()
        .findBoard()

        .find('div:nth-child(1) div:nth-child(1) div:nth-child(1)')

        .toSelector()
    );
    await paletteItemDragHandle.dragTo(board);
  }

  async toggleDashboardType(dashboardType: 'Dashboard' | 'My Items') {
    const toggle = this.page.getByRole('button', {
      name: dashboardType,
      exact: true,
    });
    await toggle.click();
  }
}
