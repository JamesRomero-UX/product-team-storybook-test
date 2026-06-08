import { resolveModuleEnabled } from '@risksmart-app/modules/src/index';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import type { DataChangeEvent } from 'src/handlers/events/DataChangeEvent';
import { getSessionData } from 'src/session';

import type { DocumentFile } from '../../../../generated/graphql';
import { VersionStatusEnum } from '../../../../generated/graphql';
import { getLogger } from '../../../logger';
import {
  CUSTOMER_SUPPORT_ROLE,
  SYSTEM_USER,
} from '../../../repositories/types';
import { AttestationConfigService } from '../../../services/attestation/attestation-config.service';
import { AttestationRecordService } from '../../../services/attestation/attestation-record.service';
import { getOrgModuleContext } from '../../../services/orgUtilities';
import { refreshAttestationRecords } from './refreshAttestations';

export type CheckAttestationsEvent = DataChangeEvent<
  DocumentFile,
  'document_file'
>;
const logger = getLogger();

/**
 * When a document version (document_file) has been created/modified, this handler refreshes the attestation status for the required users
 */
export const handler = singleEventBridgeHandler<
  string,
  CheckAttestationsEvent,
  void
>(async ({ detail }) => {
  if (detail.event.op !== 'INSERT' && detail.event.op !== 'UPDATE') {
    throw new Error('Only INSERT and UPDATE operations are supported');
  }
  const previousStatus = detail.event.data.old?.Status;
  const {
    OrgKey: orgKey,
    Id: id,
    ParentDocumentId,
    Status,
  } = detail.event.data.new;
  logger.appendKeys({ orgKey, id });
  const sessionData = getSessionData(detail.event.session_variables);
  const tenant = sessionData.tenant;
  logger.appendKeys({
    ...sessionData,
  });
  if (!orgKey) {
    throw new Error('No org key found');
  }
  if (!id) {
    throw new Error('No id found');
  }
  if (!tenant) {
    throw new Error('No tenant found');
  }

  const orgOptions = { orgKey, tenant };
  const { features, modules } = await getOrgModuleContext(orgOptions);
  const modulesSystemActive = features.includes('modules');

  const attestationsEnabled = resolveModuleEnabled({
    modules,
    moduleKey: 'document.subModules.attestation',
    modulesSystemActive,
    features,
  });
  if (!attestationsEnabled) {
    logger.info(`"document.subModules.attestation" module not enabled`, {
      orgKey,
    });

    return;
  }

  if (features.includes('attestation_improvements')) {
    // skip this to avoid double processing and notifications being sent
    logger.info('Attestation cycles are enabled. Skipping refresh.');

    return;
  }

  if (
    Status !== VersionStatusEnum.Published ||
    previousStatus == VersionStatusEnum.Published
  ) {
    logger.info('No action required for status transition', {
      status: Status,
      previousStatus,
    });

    return;
  }

  const configService = AttestationConfigService({
    orgKey,
    tenant,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });
  const recordService = AttestationRecordService({
    orgKey,
    tenant,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  const configs = await configService.findWhere({
    ParentId: { _eq: ParentDocumentId },
  });
  const config = configs[0];
  if (!config) {
    logger.info('No attestation config. Skipping');

    return;
  }

  await recordService.archiveCurrentAttestations(config.ParentId, {
    useNotAttestedStatus: features.includes('attestation_improvements'),
  });
  await refreshAttestationRecords({
    tenant,
    orgKey,
    config,
    refreshExpiry: false,
  });
  logger.info('Attestations refreshed', { parentId: config.ParentId });
});
