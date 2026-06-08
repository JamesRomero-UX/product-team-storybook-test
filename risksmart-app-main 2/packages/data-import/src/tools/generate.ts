import { generateFiles } from '../validation';

(async () => {
  console.log('Starting csv file creation');
  console.time('Generating files');
  await generateFiles(__dirname + './../generated-csv/');
  console.timeEnd('Generating files');
})();
