import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { GetFileByIdDocument } from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import { getEnv } from 'src/environment';
import { errorHandler } from 'src/errorHandler';
import { getHasuraClient } from 'src/graphqlClient';
import { getOrgId, getTenantNameFromClaims } from 'src/requestHelpers';
import { getS3PresignedUrlForDownload } from 'src/s3Services';
import { ApiHandler } from 'sst/node/api';

const bucket = getEnv('ORGANISATION_FILE_BUCKET');

export const handler = ApiHandler(
  errorHandler(async (evt) => {
    const org = getOrgId(evt);
    const fileId = evt.pathParameters?.['fileId'];
    const key = `${org}/${fileId}`;

    if (!fileId) {
      throw new BadRequest('fileId not found in path');
    }
    const hasuraClient = await getHasuraClient({
      authorization: evt.headers.authorization!,
      tenantName: getTenantNameFromClaims(evt),
    });
    await ensureHasFilePermission(hasuraClient, fileId);
    const url = await getS3PresignedUrlForDownload({ org, bucket, key });

    return {
      statusCode: 200,
      body: url,
    };
  })
);

const ensureHasFilePermission = async (
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  fileId: string
) => {
  const { data, error } = await hasuraClient.query({
    query: GetFileByIdDocument,
    variables: {
      Id: fileId,
    },
  });
  if (error) {
    throw error;
  }
  if (data.file.length !== 1) {
    throw new Forbidden('Permission for file denied');
  }
};
