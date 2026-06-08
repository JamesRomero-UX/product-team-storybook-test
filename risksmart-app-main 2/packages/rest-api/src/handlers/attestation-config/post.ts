import { BuildUpsertAttestationConfigCommand } from 'src/services/attestation/upsert-attestation-config-command';
import { getSessionData } from 'src/session';

import { backendRouteHandler } from '../../backendActionApiHandler';
import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (event) => {
  const sessionData = getSessionData(event.session_variables);
  const command = BuildUpsertAttestationConfigCommand(sessionData);
  await command.upsert({
    ParentId: event.input.object.ParentId,
    RequireGlobalAttestation: event.input.object.RequireGlobalAttestation,
    AttestationGroupIds: event.input.object.AttestationGroupIds,
    AttestationPromptText:
      event.input.object.AttestationPromptText || undefined,
    AttestationTimeLimit: event.input.object.AttestationTimeLimit || undefined,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: event.input.object.ParentId,
    }),
  };
});
