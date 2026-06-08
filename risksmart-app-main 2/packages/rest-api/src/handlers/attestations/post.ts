import { NotFound } from 'http-errors';
import { getLogger } from 'src/logger';
import { getSessionData } from 'src/session';
import { z } from 'zod';

import { backendRouteHandler } from '../../backendActionApiHandler';
import { AttestationRecordService } from '../../services/attestation/attestation-record.service';

const schema = z.object({ Id: z.string() });
const logger = getLogger();

export const handler = backendRouteHandler(schema, async (event) => {
  const sessionData = getSessionData(event.session_variables);
  const service = AttestationRecordService(sessionData);
  const id = event.input.Id;
  logger.appendKeys({ id });
  try {
    await service.attestRecord(id, sessionData.userId);
  } catch (e) {
    if (e instanceof Error && e.message === 'Record not found') {
      throw NotFound('Attestation record not found');
    }
    throw e;
  }

  return { statusCode: 200, body: JSON.stringify({ affected_rows: 1 }) };
});
