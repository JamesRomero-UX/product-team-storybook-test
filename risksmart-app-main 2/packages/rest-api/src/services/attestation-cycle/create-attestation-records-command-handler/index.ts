import { AttestationConfigService } from 'src/services/attestation/attestation-config.service';
import { AttestationRecordService } from 'src/services/attestation/attestation-record.service';
import { DocumentVersionService } from 'src/services/document-version/document-version.service';
import type { ServiceOptions } from 'src/services/types';

import { AttestationCycleDataAdaptor } from '../adaptors/attestation-cycle-data-adaptor';
import type { AttestationCycle } from '../attestation-cycle';
import type { CreateAttestationRecord } from '../attestation-record';
import { documentIdSchema } from '../document';
import { type UserId, userIdSchema } from '../user';
import { createAttestationRecordsCommandHandler as handler } from './create-attestation-records-command-handler';

export { CreateAttestationRecordsCommand } from './create-attestation-records-command-handler';

export const createCreateAttestationRecordsCommandHandler = (
  opts: ServiceOptions
) => {
  const attestationConfigService = AttestationConfigService(opts);
  const documentVersionService = DocumentVersionService(opts);
  const recordService = AttestationRecordService(opts);
  const { getById: attestationCycleByIdReader, getMostRecentByDocumentId } =
    AttestationCycleDataAdaptor(opts);

  const globalUserReader = async (): Promise<UserId[]> => {
    const users = await attestationConfigService.getGlobalAttestationUsers();

    return users.map((u) => userIdSchema.parse(u.Id));
  };

  const attestationRecordsWriter = async (
    pendingAttestationRecords: CreateAttestationRecord[]
  ): Promise<{ affectedCount: number }> => {
    const result = await recordService.createAttestationRecord(
      pendingAttestationRecords.map((input) => ({
        userId: input.userId,
        nodeId: input.documentFileId,
        configId: input.configId,
        status: input.status,
        active: input.active,
        expirationDate: input.expiresAt,
        cycleId: input.cycleId,
        carriedForwardFromRecordId: input.carriedForwardFromRecordId,
        attestedAt: input.attestedAt,
      }))
    );

    return { affectedCount: result.createdRecords.length };
  };

  const previousAttestationCycleReader = async (
    attestationCycle: AttestationCycle
  ): Promise<AttestationCycle | null> => {
    // attestationCycle.config.id is also policy ID but it doesnt feel safe to map
    const documentVersion = await documentVersionService.findById(
      attestationCycle.parentId
    );

    const documentId = documentIdSchema.parse(documentVersion.ParentDocumentId);

    return await getMostRecentByDocumentId(documentId, attestationCycle);
  };

  return handler({
    globalUserReader,
    attestationRecordsWriter,
    previousAttestationCycleReader,
    attestationCycleByIdReader,
  });
};
