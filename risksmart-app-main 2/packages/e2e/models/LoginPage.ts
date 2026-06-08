import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly getEmailAddressInput: Locator;
  readonly getPasswordInput: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getEmailAddressInput = page.getByLabel(`Email address`);
    this.getPasswordInput = page.getByLabel(`Password *`);
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async getOrganisationButton(name: string) {
    return this.page.getByRole('button', {
      name,
    });
  }

  async login(
    loginDetails: {
      emailAddress: string;
      password: string;
      organisation: string;
    },
    expectedHomePage = 'http://localhost:3000/'
  ) {
    // Email screen
    await this.getEmailAddressInput.fill(loginDetails.emailAddress);
    await this.continueButton.click();

    // Password screen
    await this.getPasswordInput.fill(loginDetails.password);
    await this.continueButton.click();

    await (
      await this.getOrganisationButton(loginDetails.organisation)
    ).click({ timeout: 15000 });

    try {
      await this.page.waitForURL(expectedHomePage, { timeout: 15000 });
    } catch {
      await this.page.getByRole('button', { name: 'Accept' }).click();
      await this.page.waitForURL(expectedHomePage);
    }
  }
}
