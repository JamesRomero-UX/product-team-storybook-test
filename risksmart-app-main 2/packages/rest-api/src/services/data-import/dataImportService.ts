import type { Readable } from 'node:stream';

import type { CsvFile } from '@risksmart-app/data-import/src/sheets';
import { csvFiles } from '@risksmart-app/data-import/src/sheets';
import type { GetDataImportsQuery } from 'generated/graphql';
import { getFile } from 'src/s3Services';
import { byteToArrayToStream } from 'src/streamUtils';

const getS3Files = async (
  orgKey: string,
  dataImport: GetDataImportsQuery['data_import'][number]
) => {
  const files = await Promise.all(
    dataImport.files.map((f) => getFile(orgKey, f.file!.Id))
  );

  return files.map((file, i) => ({
    file,
    name: dataImport.files?.[i]?.file?.FileName,
  }));
};

/**
 * @param orgKey
 * @param dataImport
 * @returns
 */
export const getStreams = async (
  orgKey: string,
  dataImport: GetDataImportsQuery['data_import'][number]
) => {
  const files = await getS3Files(orgKey, dataImport);
  const streams: { [name in CsvFile]?: Readable } = {};
  for (const fileWithName of files) {
    const byteArray = await fileWithName.file.Body!.transformToByteArray();
    const readStream = byteToArrayToStream(byteArray);
    if (!fileWithName.name) {
      throw new Error('Missing file name');
    }
    if (!csvFiles.includes(fileWithName.name as CsvFile)) {
      throw new Error(`Unsupported csv file ${fileWithName.name}`);
    }
    streams[fileWithName.name as CsvFile] = readStream;
  }

  return streams;
};
