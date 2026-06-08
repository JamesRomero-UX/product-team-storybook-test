import type { S3ClientConfig } from '@aws-sdk/client-s3';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type {
  IngestionManifest,
  IngestionRunId,
  RegulatorChangeResult,
  RegulatorId,
} from 'src/domain/types';

export const createS3Adaptor = (config: {
  bucketName: string;
  credentials?: S3ClientConfig;
}) => {
  const client = new S3Client(config.credentials || {});

  /**
   * Export per-regulator changes to S3.
   * Path: {runId}/regulators/{regulatorId}.json
   */
  const exportRegulatorChanges = async (
    ingestionRunId: IngestionRunId,
    regulatorId: RegulatorId,
    changes: RegulatorChangeResult
  ): Promise<{ location: string }> => {
    const objectKey = `${ingestionRunId}/regulators/${regulatorId}.json`;

    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: objectKey,
      Body: JSON.stringify(changes),
      ContentType: 'application/json',
    });

    await client.send(command);

    return {
      location: `s3://${config.bucketName}/${objectKey}`,
    };
  };

  /**
   * Export the ingestion manifest to S3.
   * Path: {runId}/manifest.json
   */
  const exportManifest = async (
    manifest: IngestionManifest
  ): Promise<{ location: string }> => {
    const objectKey = `${manifest.runId}/manifest.json`;

    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: objectKey,
      Body: JSON.stringify(manifest),
      ContentType: 'application/json',
    });

    await client.send(command);

    return {
      location: `s3://${config.bucketName}/${objectKey}`,
    };
  };

  return { exportRegulatorChanges, exportManifest };
};
