import 'dotenv/config';

import { program } from 'commander';

import { getClient } from '../graphqlClient';
import { SheetsProcessor } from '../services/sheetProcessor';

program.requiredOption(
  '-d, --dir <type>',
  'Path to csv files that will be imported'
);
program.parse();

const options = program.opts();
const csvDirectory = options.dir;

const sheetProcessor = new SheetsProcessor({}, {}, '', getClient());
sheetProcessor.writeCsvSampleFiles(csvDirectory);
