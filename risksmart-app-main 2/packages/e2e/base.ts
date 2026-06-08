import type { Browser, Page } from '@playwright/test';
import { test as base } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import { deleteAll, updateOrganisationFeatures } from './apiClient';
import { getEnv } from './environment';
import { App } from './models/App';
import { LoginPage } from './models/LoginPage';
import { getOrganisation } from './organisationPool';
import type { User } from './users';
import { users } from './users';

type FixtureProps = {
  page: Page;
  failOnJSError: boolean;
  user: User;
  app: App;
};

/**
 * Get auth file, logging in if required
 * @param browser
 * @param user
 * @returns
 */
export const getAuthFile = async ({
  browser,
  user,
}: {
  browser: Browser;
  user: User;
}) => {
  const fileName = path.resolve(
    test.info().project.outputDir,
    '..',
    '.auth',
    `${user.role}-${test.info().parallelIndex}`
  );
  if (fs.existsSync(fileName)) {
    // Reuse existing authentication state if any.

    return fileName;
  }

  const page = await browser.newPage({ storageState: undefined });
  await page.goto('http://localhost:3000/login');

  // Login
  const loginPage = new LoginPage(page);

  await loginPage.login({
    emailAddress: user.username,
    password: getEnv('LOGIN_PASSWORD'),
    organisation: getOrganisation().name,
  });
  await page.context().storageState({ path: fileName });
  await page.close();

  return fileName;
};

export const test = base.extend<FixtureProps>({
  failOnJSError: [true, { option: true }],
  user: [users.riskManager, { option: true }],
  storageState: async ({ browser, user }, use) => {
    const fileName = await getAuthFile({ browser, user });

    await use(fileName);
  },
  app: async ({ page }, use) => {
    await use(new App(page));
  },

  page: async ({ page, failOnJSError }, use) => {
    await deleteAll();
    await updateOrganisationFeatures([]);

    const errors: Array<Error> = [];

    page.addListener('pageerror', (error) => {
      console.log(error.message);
      errors.push(error);
    });

    const errorMessages: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') {
        errorMessages.push(m.text());
      }
    });
    await use(page);

    if (failOnJSError) {
      // Skipping this for now until we have resolved our CI issues
      //expect(errors).toHaveLength(0);
      //expect(errorMessages.filter(notFailedToFetch)).toEqual([]);
    }
  },
});

/**
 * Temporarily allowing "Failed to fetch" errors as there doesn't appear to be a customer facing issue,
 * and we're not entirely sure of the cause at the moment.
 * @param message
 * @returns
 */
/*
const notFailedToFetch = (message: string) =>
  !failedToFetchErrors.includes(message);

const failedToFetchErrors = [
  'TypeError: Failed to fetch {extra: Object}',
  'Failed to fetch',
];*/
