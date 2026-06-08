import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { getLogger } from 'src/logger';
import type { Readable } from 'stream';

import { getEnv } from './environment';
import { getOrgCredentials } from './orgTokenVender';

const logger = getLogger();

const bucket = getEnv('ORGANISATION_FILE_BUCKET');

export const getFile = async (org: string, fileId: string) => {
  const credentials = await getOrgCredentials(org);
  const s3Client = new S3Client({
    credentials,
  });

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: `${org}/${fileId}`,
  });

  return await s3Client.send(command);
};

export const deleteFile = async (org: string, fileId: string) => {
  const credentials = await getOrgCredentials(org);
  const s3Client = new S3Client({
    credentials,
  });

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: `${org}/${fileId}`,
  });

  return await s3Client.send(command);
};

interface UploadFileProps {
  org: string;
  bucket: string;
  key: string;
  data: Readable;
  contentType: string;
}

/*
 * Allows uploading of buffers, blobs or streams.
 * Useful when trying to upload large files e.g. ZIP archive
 * */
export const uploadFile = async ({
  org,
  bucket,
  key,
  data,
  contentType,
}: UploadFileProps) => {
  const credentials = await getOrgCredentials(org);
  const client = new S3Client({
    credentials,
  });

  const upload = new Upload({
    client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
    },
  });

  try {
    await upload.done();
    logger.info(`File successfully uploaded to ${bucket} bucket`);
  } catch (e) {
    logger.error('Error uploading file to S3:', e as Error);
    throw e;
  }
};

export const getS3PresignedUrlForUpload = async (
  org: string,
  metadata?: Record<string, string>
) => {
  const credentials = await getOrgCredentials(org);
  const s3Client = new S3Client({
    credentials,
  });
  const key = crypto.randomUUID();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: `${org}/${key}`,
    Metadata: metadata,
  });

  return {
    key,
    signedUrl: await getSignedUrl(s3Client, command),
  };
};

interface GetS3PresignedUrlForDownloadProps {
  org: string;
  bucket: string;
  key: string;
  expiresInSeconds?: number;
}

export const getS3PresignedUrlForDownload = async ({
  org,
  bucket,
  key,
  expiresInSeconds = 900, // 15 minutes
}: GetS3PresignedUrlForDownloadProps) => {
  logger.info('Generating presigned download url');

  const credentials = await getOrgCredentials(org);
  const s3Client = new S3Client({
    credentials,
  });
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });
};
