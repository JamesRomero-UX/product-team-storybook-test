import { DeleteObligationChangeAttestationDocument } from 'generated/graphql';
import { BadRequest } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';

import { DeleteSchema } from './schema';

export const handler = backendRouteHandler(DeleteSchema, async (body) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);

  const {
    object: { UserId, ObligationChangeId },
  } = body.input;

  const { data, errors } = await hasuraClient.mutate({
    mutation: DeleteObligationChangeAttestationDocument,
    variables: { UserId, ObligationChangeId },
  });

  if (
    errors ||
    !data?.delete_obligation_change_attestation?.returning?.length
  ) {
    throw new BadRequest(
      errors?.[0]?.message || 'Failed to delete obligation change attestation'
    );
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: data.delete_obligation_change_attestation.returning?.[0]?.Id,
    }),
  };
});
