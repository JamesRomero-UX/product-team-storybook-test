import { test } from '../base';

test(`Control Group Register heading is "Control Groups"`, async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.controlGroupRegisterPage.navigateToAndAssertTitle();
});
