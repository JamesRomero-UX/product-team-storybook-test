import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getLogger } from 'src/logger';
import { buildAttestationCycleCommandHandler } from 'src/services/attestation-cycle/create-attestation-cycle-command-handler';
import { getSessionData } from 'src/session';
import { z } from 'zod';

const logger = getLogger();
const schema = z.object({
  object: z.object({
    DocumentId: z.string().uuid(),
    AllowCarryForward: z.boolean(),
  }),
});

export const handler = backendRouteHandler(schema, async (event) => {
  const sessionData = getSessionData(event.session_variables);
  const handler = buildAttestationCycleCommandHandler(sessionData);

  logger.info(
    `Inserting new attestation cycle for documentId: ${event.input.object.DocumentId}`
  );

  const attestationCycleId = await handler.execute({
    documentId: event.input.object.DocumentId,
    allowCarryForward: event.input.object.AllowCarryForward,
  });

  logger.info('Inserted new attestation cycle with id', { attestationCycleId });

  return {
    statusCode: 200,
    body: JSON.stringify({ Id: attestationCycleId }),
  };
});
