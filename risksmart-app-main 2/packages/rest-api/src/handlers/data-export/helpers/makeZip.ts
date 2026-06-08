import type {
  GetNormalisedExportDataQuery,
  GetNormalisedRelianceBankExportDataQuery,
} from 'generated/graphql';
import { getLogger } from 'src/logger';
import { ZipFile } from 'yazl';

import { dataToCsv } from '../../../dataConverter';

const logger = getLogger();

export const makeZip = (
  data: GetNormalisedExportDataQuery | GetNormalisedRelianceBankExportDataQuery
): ZipFile => {
  logger.info('Generating ZIP file');

  const zip = new ZipFile();
  const skipped: string[] = [];

  Object.getOwnPropertyNames(data).forEach((key) => {
    const dataArray = data[key as keyof typeof data];

    if (!dataArray || dataArray.length === 0 || !Array.isArray(dataArray)) {
      skipped.push(key);

      return;
    }

    const csvData = dataToCsv(
      dataArray,
      ['CustomAttributeData'] // Exclude empty CustomAttributeData column as values are already extracted
    );
    const filename = `${key}.csv`;

    zip.addBuffer(Buffer.from(csvData), filename);
  });

  if (skipped.length > 0) {
    logger.info('Skipping empty or invalid data objects', {
      count: skipped.length,
      skipped: skipped.join(', '),
    });
  }

  logger.info('ZIP file generation completed');
  zip.end();

  return zip;
};
