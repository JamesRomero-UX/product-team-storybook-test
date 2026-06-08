import { allowedFileExtensions } from '@risksmart-app/shared/allowedFileExtensions';
import { ParentTypeEnum } from 'generated/graphql';
import { BadRequest } from 'http-errors';
import frontendApiHandler from 'src/frontendApiHandler';
import { getOrgId } from 'src/requestHelpers';
import { getS3PresignedUrlForUpload } from 'src/s3Services';

import { postSchema } from './schema';

interface PresignedUrlResponse {
  fileName: string;
  key: string;
  signedUrl: string;
}

export const handler = frontendApiHandler(
  postSchema,
  async ({ parentType, fileNames }, evt) => {
    if (!Object.values(ParentTypeEnum).includes(parentType as ParentTypeEnum)) {
      throw new BadRequest(`ParentType ${parentType} is not supported`);
    }
    if (
      fileNames.find(
        (f) =>
          !allowedFileExtensions.find((extension) =>
            f.toLowerCase().endsWith(extension)
          )
      )
    ) {
      throw new BadRequest('Unsupported file extension');
    }

    const response: PresignedUrlResponse[] = [];
    for (const fileName of fileNames) {
      const result = await getS3PresignedUrlForUpload(getOrgId(evt));
      response.push({
        fileName,
        ...result,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  }
);
