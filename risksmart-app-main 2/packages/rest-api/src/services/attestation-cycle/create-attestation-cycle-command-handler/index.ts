import { DocumentVersionService } from 'src/services/document-version/document-version.service';

import type { ServiceOptions } from '../../types';
import { AttestationCycleDataAdaptor } from '../adaptors/attestation-cycle-data-adaptor';
import { type DocumentFileId, documentFileIdSchema } from '../document-file';
import { createAttestationCycleCommandHandler } from './create-attestation-cycle-command-handler';

export const buildAttestationCycleCommandHandler = (opts: ServiceOptions) => {
  const documentVersionService = DocumentVersionService(opts);
  const { create: attestationCycleWriter } = AttestationCycleDataAdaptor(opts);

  const documentFileReader = async (
    documentId: string
  ): Promise<{
    id: DocumentFileId;
  } | null> => {
    const documentFile =
      await documentVersionService.findLatestPublishedByParentDocumentId(
        documentId
      );

    return {
      id: documentFileIdSchema.parse(documentFile?.Id ?? null),
    };
  };

  return createAttestationCycleCommandHandler({
    attestationCycleWriter,
    documentFileReader,
  });
};
