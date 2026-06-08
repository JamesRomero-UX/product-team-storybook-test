import type { GetNormalisedExportDataQuery } from 'generated/graphql';
import { getEnv } from 'src/environment';
import { getLogger } from 'src/logger';
import { getS3PresignedUrlForDownload, uploadFile } from 'src/s3Services';
import { Readable } from 'stream';

import { makeZip } from './makeZip';

const logger = getLogger();

interface UploadWithLink {
  data: GetNormalisedExportDataQuery;
  orgKey: string;
  expiresInSeconds: number;
}

export const uploadData = async ({
  data,
  orgKey,
  expiresInSeconds,
}: UploadWithLink) => {
  logger.info('Start uploading data to S3');

  const bucket = getEnv('DATA_EXPORT_BUCKET');

  if (!bucket) {
    throw new Error(
      'DATA_EXPORT_BUCKET environment variable is not configured'
    );
  }

  const zip = makeZip(data);
  const stream = Readable.from(zip.outputStream as AsyncIterable<Buffer>);

  const timestamp = new Date().toISOString().slice(0, 10);
  const key = `${orgKey}/${timestamp}.zip`;
  const contentType = 'application/zip';

  try {
    await uploadFile({ org: orgKey, bucket, key, data: stream, contentType });
    logger.info('File uploaded to bucket', {
      bucket,
      key,
    });

    return await getS3PresignedUrlForDownload({
      org: orgKey,
      bucket,
      key,
      expiresInSeconds,
    });
  } catch (error) {
    logger.error(`Failed uploading data to S3`, error as Error);
    throw error;
  }
};
