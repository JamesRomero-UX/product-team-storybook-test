import { InsertObligationChangeAttestationDocument } from 'generated/graphql';
import { BadRequest } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';

import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (body) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);

  const {
    object: { UserId, ObligationChangeId },
  } = body.input;

  const { data, errors } = await hasuraClient.mutate({
    mutation: InsertObligationChangeAttestationDocument,
    variables: { UserId, ObligationChangeId },
  });

  if (errors || !data?.insert_obligation_change_attestation_one) {
    throw new BadRequest(
      errors?.[0]?.message || 'Failed to insert obligation change attestation'
    );
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: data.insert_obligation_change_attestation_one.Id,
    }),
  };
});
