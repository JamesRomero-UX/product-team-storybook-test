import { resolveModuleEnabled } from '@risksmart-app/modules/src/index';
import type { AttestationCycle } from 'generated/graphql';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { getLogger } from 'src/logger';
import { createArchiveAttestationRecordsCommandHandler } from 'src/services/attestation-cycle/archive-attestation-records-command-handler';
import type { ArchiveAttestationRecordsCommand } from 'src/services/attestation-cycle/archive-attestation-records-command-handler/archive-attestation-records-command-handler';
import type { CreateAttestationRecordsCommand } from 'src/services/attestation-cycle/create-attestation-records-command-handler';
import { createCreateAttestationRecordsCommandHandler } from 'src/services/attestation-cycle/create-attestation-records-command-handler';
import { createEnsureSingleActiveAttestationCycleCommandHandler } from 'src/services/attestation-cycle/ensure-single-active-attestation-cycle-command-handler';
import type { EnsureSingleActiveAttestationCycleCommand } from 'src/services/attestation-cycle/ensure-single-active-attestation-cycle-command-handler/ensure-single-active-attestation-cycle-command-handler';
import { attestationCycleIdSchema } from 'src/services/attestation-cycle/types';
import { getOrgModuleContext } from 'src/services/orgUtilities';
import type { SessionData } from 'src/session';
import { getSessionData } from 'src/session';

import type { DataChangeEvent } from '../../events/DataChangeEvent';
const logger = getLogger();

export const handler = singleEventBridgeHandler<
  string,
  DataChangeEvent<AttestationCycle, 'attestation_cycle'>,
  void
>(async (event) => {
  const newItem = event.detail.event.data.new;

  if (!newItem) {
    logger.info('No new item in event, skipping');

    return;
  }

  logger.appendKeys({
    attestationCycleId: newItem?.Id,
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
    case 'INSERT':
      await ensureSingleActiveAttestationCycle(session, newItem);
      await createAttestationRecords(session, newItem);
      break;
    case 'UPDATE':
      await archiveAttestationRecords(session, newItem);
      break;
    default:
      logger.info(
        `No command handler for ${event.detail.event.op} operation, skipping.`
      );
  }
});

const ensureSingleActiveAttestationCycle = async (
  session: SessionData,
  item: AttestationCycle
) => {
  const handler =
    createEnsureSingleActiveAttestationCycleCommandHandler(session);

  const attestationCycleId = attestationCycleIdSchema.parse(item.Id);

  const command: EnsureSingleActiveAttestationCycleCommand = {
    keepActiveCycleId: attestationCycleId,
  };

  await handler.execute(command);
};

const createAttestationRecords = async (
  session: SessionData,
  item: AttestationCycle
) => {
  const handler = createCreateAttestationRecordsCommandHandler(session);

  const command: CreateAttestationRecordsCommand = {
    attestationCycleId: attestationCycleIdSchema.parse(item.Id),
  };

  await handler.execute(command);
};

const archiveAttestationRecords = async (
  session: SessionData,
  item: AttestationCycle
) => {
  const handler = createArchiveAttestationRecordsCommandHandler(session);

  const command: ArchiveAttestationRecordsCommand = {
    attestationCycleId: attestationCycleIdSchema.parse(item.Id),
  };

  await handler.execute(command);
};
