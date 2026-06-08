import { generateFiles } from '../validation';

// eslint-disable-next-line vitest/no-disabled-tests
it.skip('run generate', async () => {
  console.log('Starting csv file creation');
  console.time('Generating files');
  await generateFiles(__dirname + './../generated-csv/');
  console.timeEnd('Generating files');
});
