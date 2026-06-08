import 'dotenv/config';

import type { ApolloError } from '@apollo/client';
import { program } from 'commander';

import { insertAll, insertAllTableByTable } from '../graphqlClient';
import { getEnv } from '../utils/environment';
import { validate } from '../validate';

program.requiredOption(
  '-d, --dir <type>',
  'Path to csv files that will be imported'
);
program.parse();

const options = program.opts();
const csvDirectory = options.dir;

validate(csvDirectory, getEnv('ORG_KEY')).then(async ({ result, errors }) => {
  if (errors.length > 0) {
    console.log('Import failed');
  } else {
    const validateOnly = getEnv('VALIDATE_ONLY') ?? '';
    if (validateOnly.toLowerCase() === 'true') {
      console.log('Validate only mode. Skipping import');

      return;
    }
    console.log('Importing records');
    console.time('Import time');
    try {
      const insertMode = getEnv('INSERT_MODE');
      if (insertMode === 'PER_TABLE') {
        await insertAllTableByTable(result);
      } else {
        await insertAll(result);
      }
      console.log('Import completed successfully');
      console.timeEnd('Import time');
    } catch (ex) {
      console.log('Failed');
      console.timeEnd('Import time');
      const error = ex as ApolloError;
      console.log(ex);
      console.log(error.message);
      console.log(error.graphQLErrors);
    }
  }
});
