import fs from 'fs';

import type { ParentTypeEnum } from '../../generated/graphql';
import type { RisksmartIdLookup } from './lookCreator';

export const logIdMapping = (
  file: ParentTypeEnum,
  lookup: RisksmartIdLookup
) => {
  if (Object.keys(lookup).length === 0) {
    return;
  }
  const fileName = `./lookups/${file}`;
  if (!fs.existsSync('lookups')) {
    fs.mkdirSync('lookups');
  }
  fs.appendFileSync(fileName, `csvId,guid\n`);

  for (const id in lookup) {
    fs.appendFileSync(fileName, `${id},${lookup[id]}\n`, {});
  }
};

export const logError = (error: string) => {
  console.error(error);
  fs.appendFileSync('./errors.txt', error + '\n');
};

export interface CsvLineErrorType {
  row: number;
  message: string;
  file: string;
}

export const logCsvLineError = ({ file, row, message }: CsvLineErrorType) => {
  logError(
    `${file.padEnd(20, ' ')}\t row ${row
      .toString()
      .padStart(5, ' ')}\t ${message}`
  );
};
