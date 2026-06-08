import { S3Client } from '@aws-sdk/client-s3';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { Upload } from '@aws-sdk/lib-storage';
import {
  flattenJSON,
  getCustomAttributeLabels,
} from '@risksmart-app/data-import/src/tools/exportUtils';
import { stringify } from 'csv-stringify';
import { GetNormalisedExportDataDocument } from 'generated/graphql';
import _ from 'lodash';
import { getHasuraBackendClient } from 'src/backendGraphqlClient';
import { getEnv } from 'src/environment';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { getLogger } from 'src/logger';
import { SYSTEM_ADMIN_ROLE, SYSTEM_USER } from 'src/repositories/types';

const logger = getLogger();
const s3 = new S3Client({});
interface Credentials {
  bucketName: string;
  s3Folder: string;
  tenant: string;
  orgKey: string;
}

const getCredentials = async (): Promise<Credentials> => {
  try {
    const secretId = getEnv('PENSIONBEE_EXPORT_SECRET_NAME');
    logger.info('Retrieving database credential secret', {
      secretId,
    });
    const secretManagerClient = new SecretsManagerClient();
    const secrets = await secretManagerClient.send(
      new GetSecretValueCommand({ SecretId: secretId })
    );

    return JSON.parse(secrets.SecretString!);
  } catch (e) {
    logger.error('Failed to parse pensionbee secret', e as Error);
    throw e;
  }
};

export const handler = singleEventBridgeHandler<
  string,
  { tenant: string; orgKey: string; bucketName: string; s3Folder?: string },
  void
>(async () => {
  logger.info('Exporting Pensionbee data');

  const credentials = await getCredentials();
  const { tenant, orgKey, bucketName, s3Folder } = credentials;

  const hasuraClient = getHasuraBackendClient(
    tenant,
    orgKey,
    SYSTEM_USER,
    SYSTEM_ADMIN_ROLE
  );

  const { data, errors } = await hasuraClient.query({
    query: GetNormalisedExportDataDocument,
    variables: { orgKey },
  });

  if (errors) {
    errors.forEach((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get Pensionbee export data');
  }

  const customAttributes = _.mapValues(
    _.keyBy(data.form_configuration, 'ParentType'),
    (f) => f.customAttributeSchema
  );

  const customAttributeLabels = _.mapValues(customAttributes, (f) =>
    getCustomAttributeLabels(f)
  );

  await Promise.all(
    Object.getOwnPropertyNames(data).map(async (key) => {
      if (key === '__typename' || key === 'form_configuration') {
        return;
      }

      logger.info(
        `Retrieved: ${data[key as keyof typeof data]?.length} ${key}`
      );
      const dataArray = data[key as keyof typeof data];

      if (!Array.isArray(dataArray)) {
        return;
      }

      const flattenedData = dataArray.map((item) =>
        flattenJSON(item, {}, '', customAttributeLabels[key])
      );

      const columns = new Set(
        flattenedData.flatMap((item) => Object.keys(item))
      );

      const csvData = await new Promise<string>((resolve, reject) => {
        stringify(
          flattenedData,
          {
            header: true,
            columns: Array.from(columns),
            cast: {
              boolean: (value: boolean) => {
                return String(value);
              },
            },
          },
          function (err, data) {
            if (err) {
              logger.error('Error stringifying CSV data', err);
              reject(err);
            } else {
              resolve(data);
            }
          }
        );
      });
      const s3Key = s3Folder ? `${s3Folder}/${key}.csv` : `${key}.csv`;
      const upload = new Upload({
        client: s3,
        params: {
          Bucket: bucketName,
          Key: s3Key,
          Body: csvData,
          ContentType: 'text/csv',
        },
      });
      upload.on('httpUploadProgress', ({ loaded, total }) => {
        logger.info(`Uploading '${s3Key}' to S3: ${loaded} / ${total}`);
      });
      await upload.done();
      logger.info(`Uploaded '${s3Key}' to S3`);

      return;
    })
  );
});
