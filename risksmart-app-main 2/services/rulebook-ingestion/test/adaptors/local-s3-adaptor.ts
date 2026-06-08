import {
  GetObjectCommand,
  S3Client,
  type S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getEnv } from '@risksmart-app/shared/src/utils/environment';
import type {
  IngestionManifest,
  RegulatorChangeResult,
} from 'src/domain/types/change-detection';
import {
  ingestionManifestSchema,
  regulatorChangeResultSchema,
} from 'src/domain/types/change-detection';

export const localS3Configuration: {
  bucketName: string;
  credentials: S3ClientConfig;
} = {
  bucketName: getEnv('TEST_BUCKET_NAME'),
  credentials: {
    forcePathStyle: true,
    endpoint: getEnv('S3_ENDPOINT'),
    region: getEnv('AWS_REGION'),
    credentials: {
      accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
      secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
    },
  },
};

export const getManifest = async (
  ingestionRunId: string
): Promise<IngestionManifest> => {
  const client = new S3Client(localS3Configuration.credentials);
  const result = await client.send(
    new GetObjectCommand({
      Bucket: localS3Configuration.bucketName,
      Key: `${ingestionRunId}/manifest.json`,
    })
  );

  const body = await result.Body?.transformToString();

  return ingestionManifestSchema.parse(JSON.parse(body!));
};

export const getRegulatorChangeResult = async (
  ingestionRunId: string,
  regulatorId: string
): Promise<RegulatorChangeResult> => {
  const client = new S3Client(localS3Configuration.credentials);
  const result = await client.send(
    new GetObjectCommand({
      Bucket: localS3Configuration.bucketName,
      Key: `${ingestionRunId}/regulators/${regulatorId}.json`,
    })
  );

  const body = await result.Body?.transformToString();

  return regulatorChangeResultSchema.parse(JSON.parse(body!));
};
