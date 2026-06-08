import type { FullConfig } from '@playwright/test';
import dotenv from 'dotenv';
import { rm } from 'fs/promises';
import path from 'path';

import { disableEventsForOrg } from './eventProxyClient';
import { OrganizationPool } from './organisationPool';

const setup = async (config: FullConfig) => {
  const outputDir = config.projects[0].outputDir;

  dotenv.config({
    path: '.env',
    override: true,
  });
  await rm(path.resolve(outputDir, '..', '.auth'), {
    recursive: true,
    force: true,
  });
  await Promise.all(OrganizationPool.map((o) => disableEventsForOrg(o.orgKey)));
};
export default setup;
