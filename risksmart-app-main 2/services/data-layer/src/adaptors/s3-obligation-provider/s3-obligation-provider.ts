import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getLogger } from 'src/utils/logger';

import type {
  IngestedRegulatorySource,
  ObligationChangeset,
} from '../../handlers/org-event/processors/external-obligations-updated/types';
import { transformIngestionToObligationChangeset } from './transform';
import type {
  IngestionManifest,
  ManifestRegulatorEntry,
  RegulatorChangeResult,
} from './types';
import { ingestionManifestSchema, regulatorChangeResultSchema } from './types';

const getS3ClientConfig = () => {
  const s3Endpoint = process.env.S3_ENDPOINT;
  // Ignore missing values, placeholder values, or endpoints that are not http(s) URLs.
  if (!s3Endpoint || s3Endpoint === '-' || !/^https?:\/\//.test(s3Endpoint)) {
    return {};
  }

  return {
    endpoint: s3Endpoint,
    forcePathStyle: true,
  };
};

const s3Client = new S3Client(getS3ClientConfig());
const logger = getLogger();

const parseS3Uri = (uri: string): { bucket: string; key: string } => {
  const match = uri.match(/^s3:\/\/([^/]+)\/(.+)$/);

  if (!match) {
    throw new Error(`Invalid S3 URI format: ${uri}`);
  }

  if (match.length !== 3 || !match[1] || !match[2]) {
    throw new Error(`Invalid S3 URI format: ${uri}`);
  }

  return {
    bucket: match[1],
    key: match[2],
  };
};

export const createS3ObligationProvider = () => {
  const getJSONItemFromS3 = async (options: {
    location: string;
  }): Promise<string> => {
    const { bucket, key } = parseS3Uri(options.location);

    logger.info('Fetching external obligations from S3', {
      Bucket: bucket,
      Key: key,
    });

    const s3Object = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    const json = await s3Object.Body?.transformToString();

    if (!json) {
      logger.error('No data found in S3 object', {
        location: options.location,
      });

      throw new Error(
        `No data found in S3 object at location: ${options.location}`
      );
    }

    return json;
  };

  const getIngestionManifest = async (options: {
    location: string;
  }): Promise<IngestionManifest> => {
    const json = await getJSONItemFromS3(options);

    return ingestionManifestSchema.parse(JSON.parse(json));
  };

  const getRegulatorChangeSet = async (
    regulatorEntry: ManifestRegulatorEntry
  ): Promise<RegulatorChangeResult> => {
    const json = await getJSONItemFromS3({ location: regulatorEntry.location });

    return regulatorChangeResultSchema.parse(JSON.parse(json));
  };

  const getUpdatedExternalObligations = async (options: {
    location: string;
  }): Promise<ObligationChangeset[]> => {
    const manifest = await getIngestionManifest(options);

    const result = await Promise.all(
      manifest.regulators.map(async (regulatorEntry) => {
        const regulatorySource: IngestedRegulatorySource = {
          id: regulatorEntry.id,
          name: regulatorEntry.name,
          providerName: manifest.providerName,
        };

        const regulatorChangeSet = await getRegulatorChangeSet(regulatorEntry);

        return transformIngestionToObligationChangeset(
          regulatorySource,
          regulatorChangeSet
        );
      })
    );

    return result;
  };

  return { getUpdatedExternalObligations };
};
