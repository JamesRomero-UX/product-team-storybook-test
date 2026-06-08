import fs from 'fs';

import type { CsvFile } from './sheets';
import { csvFiles } from './sheets';
import { logError } from './utils/logging';

export const validateAllFilesPresent = (csvDirectory: string) => {
  let files: string[];
  try {
    files = fs.readdirSync(csvDirectory);
  } catch {
    logError(
      `Failed to read csv files from directory ${csvDirectory}. Please check path and try again.\n`
    );
    process.exit();
  }

  const missingFiles: string[] = [];
  const additionalFiles: string[] = [];
  for (const requiredCsvFile of csvFiles) {
    if (!files.includes(requiredCsvFile)) {
      missingFiles.push(requiredCsvFile);
    }
  }
  const allowAdditionFiles = ['.DS_Store', '.gitignore'];
  for (const file of files) {
    if (
      !csvFiles.includes(file as CsvFile) &&
      !allowAdditionFiles.includes(file)
    ) {
      additionalFiles.push(file);
    }
  }

  const noMissingFiles = missingFiles.length === 0;
  if (!noMissingFiles) {
    logError(`Missing the following csv files: ${missingFiles.join(',')}`);
    process.exit();
  }
  const noAdditionalFiles = additionalFiles.length === 0;
  if (!noAdditionalFiles) {
    logError(
      `The following files should not be present: ${additionalFiles.join(',')}`
    );
    process.exit();
  }

  return noMissingFiles && noAdditionalFiles;
};
