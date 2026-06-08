import { getLogger } from 'src/logger';
import { attestationRecordIdSchema } from 'src/services/attestation-cycle/attestation-record';
import { createMarkAttestationRecordsNotRequiredCommandHandler } from 'src/services/attestation-cycle/mark-attestation-records-not-required-command-handler';
import type { MarkAttestationRecordsNotRequiredCommand } from 'src/services/attestation-cycle/mark-attestation-records-not-required-command-handler/mark-attestation-records-not-required-command-handler';
import { getSessionData } from 'src/session';
import { z } from 'zod';

import { backendRouteHandler } from '../../../backendActionApiHandler';

const schema = z.object({ Ids: z.string().array().min(1) });
const logger = getLogger();

export const handler = backendRouteHandler(schema, async (event) => {
  const sessionData = getSessionData(event.session_variables);

  const command: MarkAttestationRecordsNotRequiredCommand = {
    attestationRecordIds: event.input.Ids.map((id) =>
      attestationRecordIdSchema.parse(id)
    ),
  };

  const handler =
    createMarkAttestationRecordsNotRequiredCommandHandler(sessionData);

  try {
    const result = await handler.execute(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ affected_rows: result.affectedCount }),
    };
  } catch (error) {
    logger.error('Error marking attestation records as not required', {
      error,
    });
    throw error;
  }
});
