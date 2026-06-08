import 'dotenv/config';

import { program } from 'commander';

import { deleteOrgData } from '../graphqlClient';
import { getEnv } from '../utils/environment';

program.parse();

(async () => {
  console.log(
    `starting org data removal for ${getEnv('ORG_KEY')} in 5 seconds`
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(
    `starting org data removal for ${getEnv('ORG_KEY')} in 4 seconds`
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(
    `starting org data removal for ${getEnv('ORG_KEY')} in 3 seconds`
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(
    `starting org data removal for ${getEnv('ORG_KEY')} in 2 seconds`
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`starting org data removal for ${getEnv('ORG_KEY')} in 1 second`);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await deleteOrgData({ OrgKey: getEnv('ORG_KEY') });

  console.log('Completed');
})();
