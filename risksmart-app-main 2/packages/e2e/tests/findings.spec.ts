import { test } from '../base';
import { users } from '../users';

[users.standard, users.riskManager].forEach((user) => {
  test.describe(`Findings heading is "Findings" (${user.role})`, () => {
    test.use({ user });
    test(user.role, async ({ page, app }) => {
      await page.goto('/');
      await app.assessmentFindingsRegisterPage.navigateToAndAssertTitle();
    });
  });
});
