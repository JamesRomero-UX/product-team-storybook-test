import 'dotenv/config';

import type { ApolloError } from '@apollo/client';
import { program } from 'commander';

import { updateAll } from '../graphqlClient';
import { getEnv } from '../utils/environment';
import { validateUpdate } from '../validate';

program.requiredOption(
  '-d, --dir <type>',
  'Path to csv files that will be updated (imported)'
);

program.parse();

const options = program.opts();
const csvDirectory = options.dir;

validateUpdate(csvDirectory, getEnv('ORG_KEY')).then(
  async ({ errors, result }) => {
    if (errors.length > 0) {
      console.log('Update failed');
    } else {
      const validateOnly = getEnv('VALIDATE_ONLY') ?? '';

      if (validateOnly.toLowerCase() === 'true') {
        console.log('Validate only mode. Skipping update');

        return;
      }

      console.log('Updating records');
      console.time('Update time');

      try {
        await updateAll(result);

        console.log('Update completed successfully');
        console.timeEnd('Update time');
      } catch (ex) {
        console.log('Failed');
        console.timeEnd('Update time');

        const error = ex as ApolloError;

        console.log(ex);
        console.log(error.message);
        console.log(error.graphQLErrors);
      }
    }
  }
);
