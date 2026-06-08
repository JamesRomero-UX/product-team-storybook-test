import { expect } from '@playwright/test';

import { test } from '../base';
import { users } from '../users';

test.describe(`Taxonomy tab title is "Translations"`, () => {
  test.use({ user: users.customerSupport });

  test(users.customerSupport.role, async ({ page, app }) => {
    await page.goto('/');
    await app.settingsPage.navigateToAndAssertTitle();
    await expect(app.settingsPage.header.title).toHaveText(`Settings`);

    expect(await app.settingsPage.tabs.allInnerTexts()).toContain(
      'Translations'
    );
    await app.settingsPage.tabs.getByText('Translations').click();

    await expect(app.settingsPage.taxonomyTab.title).toHaveText('Translations');
  });
});

test('No help button when translations not set', async ({ page, app }) => {
  await page.goto('/');
  await app.riskRegisterPage.navigateToAndAssertTitle();
  const hasHelpButton =
    await app.riskRegisterPage.header.helpButton.isVisible();
  expect(hasHelpButton).toEqual(false);
});

test.describe(`Can set custom translations`, () => {
  test.use({ user: users.customerSupport });
  test(users.customerSupport.role, async ({ page, app }) => {
    await page.goto('/');
    await app.taxonomyScenarios.addTaxonomy({
      risks: {
        registerHelp: [{ title: 'My Title', content: 'My Description' }],
      },
    });

    await app.riskRegisterPage.navigateToAndAssertTitle();
    await app.riskRegisterPage.header.helpButton.click();

    const newTitleVisible = await app.riskRegisterPage.helpPanel.component
      .getByRole('heading', { name: 'My Title' })
      .isVisible();
    await expect(newTitleVisible).toBeTruthy();
  });
});

test.describe(`Can set custom translations with links`, () => {
  test.use({ user: users.customerSupport });
  test(users.customerSupport.role, async ({ page, app }) => {
    await page.goto('/');
    await app.taxonomyScenarios.addTaxonomy({
      risks: {
        registerHelp: [
          {
            title: 'My Title',
            content:
              'Link 1 https://www.google.com test\r\nLink 2 https://www.bing.com test',
          },
        ],
      },
    });

    await app.riskRegisterPage.navigateToAndAssertTitle();
    await app.riskRegisterPage.header.helpButton.click();

    await app.riskRegisterPage.helpPanel.component
      .getByText('https://www.google.com')
      .click();
    const pagePromise = page.waitForEvent('popup');
    const newTab = await pagePromise;
    await newTab.waitForLoadState();
    await expect(newTab).toHaveURL('https://www.google.com');
  });
});
