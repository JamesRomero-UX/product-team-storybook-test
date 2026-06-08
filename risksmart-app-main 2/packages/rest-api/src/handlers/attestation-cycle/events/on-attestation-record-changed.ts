import { resolveModuleEnabled } from '@risksmart-app/modules/src/index';
import type { AttestationRecord } from 'generated/graphql';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { getLogger } from 'src/logger';
import { createRefreshAttestationCycleStatusCommandHandler } from 'src/services/attestation-cycle/refresh-attestation-cycle-status-command-handler';
import type { RefreshAttestationCycleStatusCommand } from 'src/services/attestation-cycle/refresh-attestation-cycle-status-command-handler/refresh-attestation-cycle-status-command-handler';
import { attestationCycleIdSchema } from 'src/services/attestation-cycle/types';
import { getOrgModuleContext } from 'src/services/orgUtilities';
import type { SessionData } from 'src/session';
import { getSessionData } from 'src/session';

import type { DataChangeEvent } from '../../events/DataChangeEvent';

const logger = getLogger();

export const handler = singleEventBridgeHandler<
  string,
  DataChangeEvent<AttestationRecord, 'attestation_record'>,
  void
>(async (event) => {
  const newItem = event.detail.event.data.new;

  if (!newItem) {
    logger.info('No new item in event, skipping');

    return;
  }

  logger.appendKeys({
    attestationRecordId: newItem?.Id,
    attestationCycleId: newItem?.CycleId,
  });

  const session = getSessionData(event.detail.event?.session_variables);
  logger.appendKeys({
    ...session,
  });

  const orgOptions = { orgKey: session.orgKey, tenant: session.tenant };
  const { features, modules } = await getOrgModuleContext(orgOptions);
  const modulesSystemActive = features.includes('modules');

  const attestationsEnabled = resolveModuleEnabled({
    modules,
    moduleKey: 'document.subModules.attestation',
    modulesSystemActive,
    features,
  });

  if (!attestationsEnabled || !features.includes('attestation_improvements')) {
    logger.info('Attestation cycles are not enabled.');

    return;
  }

  switch (event.detail.event.op) {
    case 'UPDATE':
      await refreshAttestationCycleStatus(session, newItem);
      break;
    default:
      logger.info(
        `No command handler for ${event.detail.event.op} operation, skipping.`
      );
  }
});

const refreshAttestationCycleStatus = async (
  session: SessionData,
  item: AttestationRecord
) => {
  const handler = createRefreshAttestationCycleStatusCommandHandler(session);

  const command: RefreshAttestationCycleStatusCommand = {
    attestationCycleId: attestationCycleIdSchema.parse(item.CycleId),
  };

  await handler.execute(command);
};
