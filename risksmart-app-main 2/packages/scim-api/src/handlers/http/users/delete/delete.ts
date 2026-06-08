import { scimEnterpriseUserSchema } from 'src/scim/schemas';
import { ApiHandler } from 'sst/node/api';
import type { z } from 'zod';

/* eslint-disable @typescript-eslint/no-unused-vars */
const postSchema = scimEnterpriseUserSchema.omit({ id: true });

export type PostSchema = z.infer<typeof postSchema>;

export const handler = ApiHandler(async (event) => {
  console.log('event', event);

  return {
    statusCode: 204,
    // headers: {
    //   'Content-Type': 'application/scim+json',
    // },
    // body: JSON.stringify(dummyResponse),
  };
});
