import { expect } from '@playwright/test';
import _ from 'lodash';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import { IssueVariantRegisterPage } from '../models/IssueVariantRegisterPage';
import { IssueVariantScenarios } from '../scenarios/issueVariantScenarios';
import { users } from '../users';

const variant = {
  singular: 'Customer trust',
  plural: 'Customer trusts',
};

[
  users.public,
  users.standard,
  users.riskManager,
  users.customerSupport,
].forEach((user) => {
  test.describe(`Report an Issue heading is "Report a ${variant.singular}" when selected`, () => {
    test.use({ user });
    test(user.role, async ({ page, app }) => {
      await updateOrganisationFeatures(['issue-gc']);
      await page.goto('/');
      await app.reportAnIssuePage.navigateToAndAssertTitle();

      await app.reportAnIssuePage.selectIssueType(
        _.capitalize(variant.singular)
      );

      await expect(app.reportAnIssuePage.header.title).toHaveText(
        `Report a ${variant.singular.toLowerCase()}`
      );
    });
  });
});

[
  users.public,
  users.standard,
  users.riskManager,
  users.customerSupport,
].forEach((user) => {
  test.describe(`Success message shown after reporting a ${variant.singular}`, () => {
    test.use({ user });
    test(user.role, async ({ page, app }) => {
      await updateOrganisationFeatures(['issue-gc']);
      await page.goto('/');
      await app.reportAnIssuePage.navigateToAndAssertTitle();

      await app.reportAnIssuePage.selectIssueType(
        _.capitalize(variant.singular)
      );

      await expect(app.reportAnIssuePage.header.title).toHaveText(
        `Report a ${variant.singular.toLowerCase()}`
      );

      await app.reportAnIssuePage.issueForm.fillFormAndClickSave({
        title: `Report a ${variant.singular} 1`,
        details: 'Details 1',
        dateIdentified: '2020-01-01',
        dateOccurred: '2020-01-01',
      });

      await app.reportAnIssuePage.notificationBanner.expectNotification(
        `${variant.singular} added successfully`
      );

      await expect(app.issueReportedPage.title).toHaveText(
        `Thank you for submitting a ${variant.singular.toLowerCase()}`
      );
    });
  });
});

[users.riskManager, users.customerSupport].forEach((user) => {
  test.describe(`Report an issue page reports correct variant ${variant.singular}`, () => {
    test.use({ user });
    test(user.role, async ({ page, app }) => {
      await updateOrganisationFeatures(['issue-gc']);
      await page.goto('/');
      await app.reportAnIssuePage.navigateToAndAssertTitle();

      await app.reportAnIssuePage.selectIssueType(variant.singular);

      await expect(app.reportAnIssuePage.header.title).toHaveText(
        `Report a ${variant.singular.toLowerCase()}`
      );

      const issueTitle = `${variant.singular} 1`;

      await app.reportAnIssuePage.issueForm.fillFormAndClickSave({
        title: issueTitle,
        details: 'Details 1',
        dateIdentified: '2020-01-01',
        dateOccurred: '2020-01-01',
      });

      await app.reportAnIssuePage.notificationBanner.expectNotification(
        `${variant.singular} added successfully`
      );

      await expect(app.issueReportedPage.title).toHaveText(
        `Thank you for submitting a ${variant.singular.toLowerCase()}`
      );

      await page.goto('/');
      const issueVariantRegister = new IssueVariantRegisterPage(
        page,
        variant.singular
      );
      await issueVariantRegister.navigateTo(variant.plural);

      await issueVariantRegister.table.expectRowCount(1);
      await (await issueVariantRegister.table.getBodyCell('Title', 1))
        .getByText(issueTitle)
        .click();

      await expect(app.issueDetailsPage.header.title).toHaveText(issueTitle);
    });
  });
});

[users.standard, users.riskManager].forEach((user) => {
  test.describe(`${variant.singular} Register heading is "${variant.singular} Register"`, () => {
    test.use({ user });
    test(user.role, async ({ page }) => {
      await updateOrganisationFeatures(['issue-gc']);
      await page.goto('/');
      const issueVariantRegister = new IssueVariantRegisterPage(
        page,
        variant.singular
      );
      await issueVariantRegister.navigateTo(variant.plural);
      await expect(issueVariantRegister.header.title).toHaveText(
        `${_.startCase(variant.singular)} Register`
      );
    });
  });
});

test(`${variant.singular} details cancel navigates to register`, async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['issue-gc']);
  await page.goto('/');
  const issueTitle = 'Issue 1';
  const issueVariantScenarios = new IssueVariantScenarios(page, variant);
  await issueVariantScenarios.createIssueVariant({
    title: issueTitle,
    details: `Issue ${variant.singular} description 1`,
  });

  const issueRegister = new IssueVariantRegisterPage(page, variant.singular);

  await (await issueRegister.table.getBodyCell('Title', 1))
    .getByText(issueTitle)
    .click();

  await expect(app.issueDetailsPage.header.title).toHaveText(issueTitle);

  await app.issueDetailsPage.issueDetailsTab.issueForm.cancelButton.click();
  await expect(issueRegister.header.title).toHaveText(
    `${_.startCase(variant.singular)} Register`
  );
});

test(`A saved ${variant.singular} is shown in the register`, async ({
  page,
}) => {
  await updateOrganisationFeatures(['issue-gc']);
  await page.goto('/');
  const issueRegister = new IssueVariantRegisterPage(page, variant.singular);

  const issueTitle = `Issue ${variant.singular} 1`;
  const issueVariantScenarios = new IssueVariantScenarios(page, variant);
  await issueVariantScenarios.createIssueVariant({
    title: issueTitle,
    details: `Issue ${variant.singular} description 1`,
  });

  await expect(await issueRegister.table.getBodyCell('Title', 1)).toHaveText(
    issueTitle
  );
});

test(`Saving ${variant.singular} assessment`, async ({ page, app }) => {
  await updateOrganisationFeatures(['issue-gc']);
  await page.goto('/');
  const issueTitle = `Issue ${variant.singular} 1`;
  const issueVariantScenarios = new IssueVariantScenarios(page, variant);
  await issueVariantScenarios.createIssueVariant({
    title: issueTitle,
    details: `Issue ${variant.singular} description 1`,
  });

  const issueRegister = new IssueVariantRegisterPage(page, variant.singular);
  await (await issueRegister.table.getBodyCell('Title', 1))
    .getByText(issueTitle)
    .click();

  await expect(app.issueDetailsPage.header.title).toHaveText(issueTitle);

  await app.issueDetailsPage.issueAssessmentTab.selectTabAndAssertTitle(
    'Assessment'
  );
  await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fillFormAndClickSave(
    {
      status: 'Closed',
    }
  );

  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Assessment updated successfully'
  );
});

test(`Saving ${variant.singular} update`, async ({ page, app }) => {
  await updateOrganisationFeatures(['issue-gc']);
  await page.goto('/');
  const issueTitle = 'Issue 1';
  const issueVariantScenarios = new IssueVariantScenarios(page, variant);
  await issueVariantScenarios.createIssueVariant({
    title: issueTitle,
    details: 'Issue description 1',
  });

  const issueRegister = new IssueVariantRegisterPage(page, variant.singular);
  await (await issueRegister.table.getBodyCell('Title', 1))
    .getByText(issueTitle)
    .click();

  await expect(app.issueDetailsPage.header.title).toHaveText(issueTitle);

  await app.issueDetailsPage.issueUpdateTab.selectTabAndAssertTitle('Updates');
  await app.issueDetailsPage.issueUpdateTab.addButton.click();
  const issueUpdateTitle = 'Update 1';
  await app.issueDetailsPage.issueUpdateTab.issueUpdateForm.fillFormAndClickSave(
    {
      title: 'Update 1',
      description: 'Update description 1',
    }
  );

  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Update added successfully'
  );

  await expect(
    await app.issueDetailsPage.issueUpdateTab.table.getBodyCell('Title', 1)
  ).toHaveText(issueUpdateTitle);
});

test(`${variant.singular} assessment cancel navigates to details`, async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['issue-gc']);
  await page.goto('/');
  const issueTitle = 'Issue 1';
  const issueVariantScenarios = new IssueVariantScenarios(page, variant);
  await issueVariantScenarios.createIssueVariant({
    title: issueTitle,
    details: 'Issue description 1',
  });

  const issueRegister = new IssueVariantRegisterPage(page, variant.singular);
  await (await issueRegister.table.getBodyCell('Title', 1))
    .getByText(issueTitle)
    .click();
  await expect(app.issueDetailsPage.header.title).toHaveText(issueTitle);

  await app.issueDetailsPage.issueAssessmentTab.selectTabAndAssertTitle(
    'Assessment'
  );

  await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.cancelButton.click();

  await expect(app.issueDetailsPage.activeTab).toHaveText('Details');
});
