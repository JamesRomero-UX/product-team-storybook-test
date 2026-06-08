import { type Locator, type Page } from '@playwright/test';

export class NavigationComponent {
  readonly page: Page;
  readonly getComponent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getComponent = page.getByTestId('navigation');
  }

  async click(navItemText: string, exact?: boolean) {
    const component = await this.getComponent;
    await component.getByText(navItemText, { exact }).click();
  }

  async childNavItemVisible(
    navItemText: string,
    childNavItemText: string,
    exact?: boolean
  ): Promise<boolean> {
    const component = await this.getComponent;
    const result = await component
      .getByText(navItemText, { exact })
      .locator('../../..')
      .getByText(childNavItemText, { exact })
      .isVisible();

    return result;
  }

  async clickChild(
    navItemText: string,
    childNavItemText: string,
    exact?: boolean
  ) {
    const component = await this.getComponent;
    const childLink = component
      .getByText(navItemText, { exact })
      .locator('../../..')
      .getByText(childNavItemText, { exact });

    await childLink.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(200);
    await childLink.click({ force: true });
  }

  /**
   * Navigate to a child nav item, opening parent as required
   *
   * @param navItemText
   * @param childNavItemText
   * @param clickFirst
   * @param exact
   */
  async navigateToChild(
    navItemText: string,
    childNavItemText: string,
    clickFirst: boolean = false,
    exact?: boolean
  ): Promise<void> {
    if (
      !(await this.childNavItemVisible(navItemText, childNavItemText, exact))
    ) {
      await this.click(navItemText, exact);
      await this.page.waitForTimeout(300);
    }
    if (clickFirst) {
      await this.clickFirst(childNavItemText, exact);
    } else {
      await this.clickChild(navItemText, childNavItemText, exact);
    }
  }

  async clickFirst(navItemText: string, exact?: boolean) {
    const component = await this.getComponent;
    await component.getByText(navItemText, { exact }).nth(0).click();
  }
}
